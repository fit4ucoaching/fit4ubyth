import { buildProgressAnalysisPrompt } from "../prompts/systemPrompts";
import type { AnalyticsSnapshot } from "./types";

const PERIOD_LABEL: Record<AnalyticsSnapshot["period"], string> = {
  daily: "quotidien", weekly: "hebdomadaire", monthly: "mensuel", annual: "annuel",
};

/**
 * Domain Prompt du module Analytics — génère Teddy Daily/Weekly/Monthly
 * (Volume 5). La détection de stagnation/progression/risque d'abandon reste
 * une règle déterministe (voir `detectTrend`), le LLM ne fait que la
 * formuler de façon motivante.
 */
export function buildAnalyticsDomainPrompt(snapshot: AnalyticsSnapshot, userContext: string): string {
  const trend = detectTrend(snapshot);
  const rawData = JSON.stringify(snapshot);

  return `${buildProgressAnalysisPrompt(userContext, rawData)}

Rapport ${PERIOD_LABEL[snapshot.period]}. Tendance détectée : ${trend}.
Mets en avant les points positifs avant les axes d'amélioration. ${
    trend === "risque_abandon"
      ? "Le ton doit rester bienveillant et proposer une reprise simple, sans culpabiliser."
      : ""
  }`;
}

export type Trend = "progression" | "stagnation" | "risque_abandon" | "premier_rapport";

/** Détection déterministe (Volume 5 : "Identifier stagnation, progression, risque d'abandon"). */
export function detectTrend(snapshot: AnalyticsSnapshot): Trend {
  if (!snapshot.previousPeriodComparison) return "premier_rapport";
  if (snapshot.adherenceRate < 0.3) return "risque_abandon";
  if (snapshot.workoutsCompleted > snapshot.previousPeriodComparison.workoutsCompleted) return "progression";
  if (snapshot.workoutsCompleted === snapshot.previousPeriodComparison.workoutsCompleted) return "stagnation";
  return "risque_abandon";
}

export * from "./types";
