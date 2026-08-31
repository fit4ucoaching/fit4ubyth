import OpenAI from "openai";

import type { TeddyMessage, TeddyReply, TeddySuggestedAction } from "../types/teddy.types";
import { buildCoachSystemPrompt } from "../prompts/systemPrompts";
import { detectDistressSignal, DISTRESS_REDIRECT_MESSAGE } from "../safety/teddySafetyService";

const MODEL = "gpt-4o-mini";

/**
 * Cœur conversationnel de Teddy — le SDK reçoit un client OpenAI déjà
 * configuré (injecté par l'appelant, ex. `backend/src/ai/ai.service.ts`)
 * plutôt que de lire une variable d'environnement lui-même : le SDK reste
 * agnostique de tout runtime spécifique (backend Node, futur worker
 * serverless…), conformément à son rôle de module partagé du monorepo.
 */
export async function generateTeddyReply(
  openai: OpenAI,
  params: {
    userContext: string;
    history: { role: "user" | "teddy" | "system"; content: string }[];
    newMessage: string;
  },
): Promise<TeddyReply> {
  if (detectDistressSignal(params.newMessage)) {
    return {
      message: buildTeddyMessage(DISTRESS_REDIRECT_MESSAGE),
    };
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildCoachSystemPrompt(params.userContext) },
      ...params.history.map((m) => ({
        role: m.role === "teddy" ? ("assistant" as const) : (m.role as "user" | "system"),
        content: m.content,
      })),
      { role: "user", content: params.newMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message.content ?? "Désolé, je n'ai pas pu répondre.";
  return {
    message: buildTeddyMessage(content),
    suggestedActions: inferSuggestedActions(content),
  };
}

function buildTeddyMessage(content: string): TeddyMessage {
  return {
    id: crypto.randomUUID(),
    role: "teddy",
    content,
    createdAt: new Date().toISOString(),
  };
}

/** Heuristique simple de suggestion d'action — affinable avec function calling OpenAI plus tard. */
function inferSuggestedActions(content: string): TeddySuggestedAction[] | undefined {
  const lower = content.toLowerCase();
  const actions: TeddySuggestedAction[] = [];

  if (lower.includes("séance") || lower.includes("entraînement")) {
    actions.push({ type: "start_workout", label: "Démarrer une séance" });
  }
  if (lower.includes("repas") || lower.includes("nutrition") || lower.includes("manger")) {
    actions.push({ type: "log_meal", label: "Enregistrer un repas" });
  }

  return actions.length > 0 ? actions : undefined;
}
