import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat/completions";

import { formatMemoryForPrompt } from "../memory/formatMemory";
import type { TeddyFullMemory } from "../memory/types";
import { TEDDY_GLOBAL_SAFETY_PROMPT } from "../prompts/globalSafetyPrompt";
import { TEDDY_IDENTITY_PROMPT } from "../prompts/identityPrompt";
import { buildPromptChain } from "../prompts/promptChain";
import { checkSafety } from "../safety/safetyDomains";
import { toOpenAIToolsFormat } from "../tools/toolRegistry";
import type { TeddyMessage, TeddyReply, TeddySuggestedAction } from "../types/teddy.types";
import { buildDomainPrompt, type DomainPromptContexts } from "./buildDomainPrompt";
import { detectContext, type DetectedDomain } from "./contextDetection";

const MODEL = "gpt-4o-mini";

export interface TeddyCoreInput {
  memory: TeddyFullMemory;
  history: { role: "user" | "teddy" | "system"; content: string }[];
  newMessage: string;
  domainContexts: DomainPromptContexts;
  /**
   * Overrides résolus par le BACKEND depuis `PromptOverride` (jamais lu
   * directement par le SDK — aucun accès Prisma ici, cohérent avec le
   * reste de l'architecture Volume 5). Absent ou sans entrée pour le
   * domaine détecté → repli automatique sur `buildDomainPrompt()` (la
   * constante TypeScript). Le domaine "general" n'a jamais d'override —
   * le prompt de repli reste toujours codé en dur.
   */
  domainPromptOverrides?: Partial<Record<Exclude<DetectedDomain, "general">, string>>;
}

/**
 * Résultat d'un tour d'orchestration : soit une réponse finale directement
 * utilisable, soit une liste d'appels d'outils à exécuter côté backend
 * (seul endroit ayant accès à Prisma — voir `tools/types.ts`). Dans ce
 * second cas, le backend appelle `completeTeddyTurn()` avec les résultats.
 */
export type TeddyTurnResult =
  | { status: "final"; reply: TeddyReply }
  | { status: "requires_tools"; toolCalls: ChatCompletionMessageToolCall[]; pendingMessages: ChatCompletionMessageParam[] };

/**
 * Teddy Core (Volume 5) — orchestrateur central. Responsabilités strictes :
 * compréhension du contexte (délégué à `contextDetection`), routage
 * (délégué à `buildDomainPrompt`), gestion des outils (délégué au registre
 * `tools/`, exécution déléguée au backend), mémoire (déléguée à `memory/`),
 * sécurité (déléguée à `safety/`), cohérence de la réponse (ce fichier).
 * "Le Core ne contient pas de logique métier complexe. Il délègue."
 */
export async function initiateTeddyTurn(openai: OpenAI, input: TeddyCoreInput): Promise<TeddyTurnResult> {
  // 1) Sécurité — priorité absolue, avant tout routage ou appel LLM.
  const safety = checkSafety(input.newMessage);
  if (safety.triggered) {
    return { status: "final", reply: { message: buildTeddyMessage(safety.redirectMessage!) } };
  }

  // 2) Détection de contexte — routage vers le bon module.
  const { domain } = detectContext(input.newMessage);

  // 2bis) Résolution du Domain Prompt — override BackOffice (Teddy Control
  // Center) prioritaire s'il existe pour ce domaine, sinon repli sur la
  // constante TypeScript. Le domaine "general" et tout ce qui touche à
  // l'identité/sécurité (étapes suivantes) ne sont JAMAIS override-ables.
  const domainOverride = domain !== "general" ? input.domainPromptOverrides?.[domain] : undefined;
  const domainPrompt = domainOverride ?? buildDomainPrompt(domain, input.domainContexts);

  // 3) Construction de la chaîne de prompts hiérarchique complète.
  const systemPrompt = buildPromptChain({
    systemPrompt: TEDDY_IDENTITY_PROMPT,
    safetyPrompt: TEDDY_GLOBAL_SAFETY_PROMPT,
    domainPrompt,
    userMemory: formatMemoryForPrompt(input.memory),
    conversationContext: input.memory.conversational.intelligentSummary ?? "Aucun résumé disponible.",
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...input.history.map((m) => toOpenAIMessage(m)),
    { role: "user", content: input.newMessage },
  ];

  // 4) Appel LLM — outils disponibles selon le domaine détecté (le modèle décide de les utiliser ou non).
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    tools: toOpenAIToolsFormat(),
    temperature: 0.7,
    max_tokens: 600,
  });

  const choice = completion.choices[0];
  const toolCalls = choice?.message.tool_calls;

  if (toolCalls && toolCalls.length > 0) {
    return {
      status: "requires_tools",
      toolCalls,
      pendingMessages: [...messages, choice.message as ChatCompletionMessageParam],
    };
  }

  const content = choice?.message.content ?? "Désolé, je n'ai pas pu répondre.";
  return {
    status: "final",
    reply: {
      message: buildTeddyMessage(content),
      suggestedActions: inferSuggestedActions(content, domain),
      usage: extractUsage(completion),
    },
  };
}

/**
 * Deuxième phase — appelée par le backend une fois les outils exécutés
 * (voir `backend/src/ai/tools/toolExecutor.ts`), avec leurs résultats.
 * Reprend la conversation exactement là où `initiateTeddyTurn` l'a laissée.
 */
export async function completeTeddyTurn(
  openai: OpenAI,
  pendingMessages: ChatCompletionMessageParam[],
  toolResults: { toolCallId: string; result: unknown }[],
): Promise<TeddyReply> {
  const messages: ChatCompletionMessageParam[] = [
    ...pendingMessages,
    ...toolResults.map(
      (tr): ChatCompletionMessageParam => ({
        role: "tool",
        tool_call_id: tr.toolCallId,
        content: JSON.stringify(tr.result),
      }),
    ),
  ];

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = completion.choices[0]?.message.content ?? "Désolé, je n'ai pas pu finaliser ma réponse.";
  return { message: buildTeddyMessage(content), usage: extractUsage(completion) };
}

/** Extrait l'usage tokens renvoyé par OpenAI — absent seulement si le prestataire omet le champ (rare, jamais sur une réponse réussie). */
function extractUsage(completion: { model: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }) {
  if (!completion.usage) return undefined;
  return {
    model: completion.model,
    promptTokens: completion.usage.prompt_tokens,
    completionTokens: completion.usage.completion_tokens,
    totalTokens: completion.usage.total_tokens,
  };
}

function toOpenAIMessage(m: { role: "user" | "teddy" | "system"; content: string }): ChatCompletionMessageParam {
  const role = m.role === "teddy" ? "assistant" : m.role;
  return { role, content: m.content } as ChatCompletionMessageParam;
}

function buildTeddyMessage(content: string): TeddyMessage {
  return { id: crypto.randomUUID(), role: "teddy", content, createdAt: new Date().toISOString() };
}

function inferSuggestedActions(content: string, domain: DetectedDomain): TeddySuggestedAction[] | undefined {
  const lower = content.toLowerCase();
  const actions: TeddySuggestedAction[] = [];

  if (domain === "coach" || lower.includes("séance")) actions.push({ type: "start_workout", label: "Démarrer une séance" });
  if (domain === "nutrition" || lower.includes("repas")) actions.push({ type: "log_meal", label: "Enregistrer un repas" });
  if (domain === "analytics") actions.push({ type: "view_progress", label: "Voir ma progression" });

  return actions.length > 0 ? actions : undefined;
}
