import OpenAI from "openai";

import type { TeddyFullMemory } from "./types";

/**
 * Mémoire long terme (Volume 5) — condense l'historique conversationnel +
 * la mémoire évolutive en un résumé court et dense, du type : "L'utilisateur
 * s'entraîne principalement le soir, préfère les haltères, évite la course,
 * suit actuellement un objectif de perte de poids." Ce résumé alimente les
 * futurs prompts à la place de l'historique brut complet — appelé
 * périodiquement par le backend (ex. tous les 20 messages), jamais à chaque
 * tour de conversation (coût/latence).
 */
export async function generateIntelligentSummary(
  openai: OpenAI,
  memory: Pick<TeddyFullMemory, "evolutive" | "conversational">,
): Promise<string> {
  const rawContext = JSON.stringify({
    recentMessages: memory.conversational.recentMessages.slice(-20),
    evolutive: memory.evolutive,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Résume en 2-4 phrases denses et factuelles les habitudes, préférences et
situation actuelle de cet utilisateur, à partir de son historique récent. Style télégraphique,
uniquement des faits actionnables pour personnaliser un futur conseil fitness/nutrition. Pas de
politesse, pas de commentaire — uniquement le résumé.`,
      },
      { role: "user", content: rawContext },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return completion.choices[0]?.message.content ?? "";
}
