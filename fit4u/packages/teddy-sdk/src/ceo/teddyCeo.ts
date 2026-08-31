import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat/completions";

import type { TeddyMessage, TeddyReply } from "../types/teddy.types";
import { buildCeoPromptChain } from "./ceoPromptChain";
import { TEDDY_CEO_IDENTITY_PROMPT, TEDDY_CEO_SAFETY_PROMPT } from "./ceoPrompts";
import { toOpenAICeoToolsFormat } from "./ceoTools";

const MODEL = "gpt-4o-mini";

export interface TeddyCeoInput {
  history: { role: "user" | "teddy" | "system"; content: string }[];
  newMessage: string;
}

export type TeddyCeoTurnResult =
  | { status: "final"; reply: TeddyReply }
  | { status: "requires_tools"; toolCalls: ChatCompletionMessageToolCall[]; pendingMessages: ChatCompletionMessageParam[] };

/**
 * Teddy CEO (Evolution.md concrétisé) — même architecture en 2 phases que
 * `core/teddyCore.ts` (outils déclarés ici, exécutés côté backend), mais
 * SANS mémoire utilisateur ni détection de sécurité utilisateur (le
 * contexte est plateforme, pas conversation avec un coaché). Ne partage
 * aucun état avec `teddyCore.ts` — deux persona, deux flux distincts,
 * jamais mélangés (voir `ceoPrompts.ts`).
 */
export async function initiateCeoTurn(openai: OpenAI, input: TeddyCeoInput): Promise<TeddyCeoTurnResult> {
  const systemPrompt = buildCeoPromptChain({
    systemPrompt: TEDDY_CEO_IDENTITY_PROMPT,
    safetyPrompt: TEDDY_CEO_SAFETY_PROMPT,
    platformContext: "Contexte : BackOffice Fit4U by TH, session d'un membre de l'équipe authentifié avec un rôle admin.",
    conversationContext: input.history.length > 0 ? "Voir historique des messages ci-dessous." : "Nouvelle conversation.",
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...input.history.map((m): ChatCompletionMessageParam => ({ role: m.role === "teddy" ? "assistant" : m.role, content: m.content })),
    { role: "user", content: input.newMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    tools: toOpenAICeoToolsFormat(),
    temperature: 0.4, // plus factuel que le coach utilisateur (0.7) — moins de créativité attendue sur des KPI
    max_tokens: 700,
  });

  const choice = completion.choices[0];
  const toolCalls = choice?.message.tool_calls;

  if (toolCalls && toolCalls.length > 0) {
    return { status: "requires_tools", toolCalls, pendingMessages: [...messages, choice.message as ChatCompletionMessageParam] };
  }

  const content = choice?.message.content ?? "Désolé, je n'ai pas pu répondre.";
  return { status: "final", reply: { message: buildCeoMessage(content) } };
}

export async function completeCeoTurn(
  openai: OpenAI,
  pendingMessages: ChatCompletionMessageParam[],
  toolResults: { toolCallId: string; result: unknown }[],
): Promise<TeddyReply> {
  const messages: ChatCompletionMessageParam[] = [
    ...pendingMessages,
    ...toolResults.map((tr): ChatCompletionMessageParam => ({ role: "tool", tool_call_id: tr.toolCallId, content: JSON.stringify(tr.result) })),
  ];

  const completion = await openai.chat.completions.create({ model: MODEL, messages, temperature: 0.4, max_tokens: 700 });

  const content = completion.choices[0]?.message.content ?? "Désolé, je n'ai pas pu finaliser ma réponse.";
  return { message: buildCeoMessage(content) };
}

function buildCeoMessage(content: string): TeddyMessage {
  return { id: crypto.randomUUID(), role: "teddy", content, createdAt: new Date().toISOString() };
}
