import OpenAI from "openai";

/**
 * Teddy DNA (Volume 5) — "Le profil évolue après chaque interaction."
 * Extrait les faits nouveaux et durables d'un échange (une préférence
 * exprimée, une contrainte, un horaire mentionné) pour alimentation de la
 * mémoire évolutive (`AIMemory`, voir `backend/src/ai/memory`). Ne modifie
 * jamais la mémoire permanente issue de sources structurées (`Profile`) —
 * uniquement les faits libres non couverts par une table dédiée.
 */
export interface DNAExtractionResult {
  /** Paires clé/valeur à mémoriser, ex. { "prefers_morning_workouts": true }. */
  facts: Record<string, unknown>;
  /** Explique pourquoi chaque fait a été extrait — utile pour l'audit/debug, jamais montré à l'utilisateur. */
  rationale: string;
}

export async function extractDNAFacts(
  openai: OpenAI,
  exchange: { userMessage: string; teddyReply: string },
): Promise<DNAExtractionResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Analyse cet échange entre un utilisateur et Teddy (coach fitness). Extrait
UNIQUEMENT les faits durables et réutilisables (préférence, contrainte, habitude, horaire) que
Teddy devrait retenir pour personnaliser ses futures réponses. Ignore le bavardage sans valeur
informative. Réponds en JSON strict : { "facts": { "clé_snake_case": valeur }, "rationale": "..." }.
Si rien de notable, réponds { "facts": {}, "rationale": "aucun fait durable" }.`,
      },
      {
        role: "user",
        content: `Utilisateur : ${exchange.userMessage}\nTeddy : ${exchange.teddyReply}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
    max_tokens: 250,
  });

  const raw = completion.choices[0]?.message.content ?? '{"facts":{},"rationale":""}';
  return JSON.parse(raw) as DNAExtractionResult;
}
