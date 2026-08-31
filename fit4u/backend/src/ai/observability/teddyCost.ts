import type { TeddyUsage } from "@fit4u/teddy-sdk";

/**
 * Estimation du coût IA (Volume 8 §53) — tarifs approximatifs par modèle,
 * en dixièmes de millième de centime par token pour éviter l'arrondi
 * flottant sur de très petits montants. **À vérifier/mettre à jour
 * régulièrement contre la page tarifaire officielle du prestataire** — ces
 * constantes ne sont pas synchronisées automatiquement.
 */
const PRICING_PER_MILLION_TOKENS_USD: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
};

const DEFAULT_PRICING = PRICING_PER_MILLION_TOKENS_USD["gpt-4o-mini"]!;

/** Retourne le coût estimé en dixièmes de millième de dollar (unité mineure précise, jamais un float arrondi — Volume 7 §21 appliqué ici aussi). */
export function estimateTeddyCostMicroUsd(usage: TeddyUsage): number {
  const pricing = PRICING_PER_MILLION_TOKENS_USD[usage.model] ?? DEFAULT_PRICING;
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 1_000_000); // micro-dollars (1 000 000 = 1 USD)
}
