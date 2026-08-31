/**
 * Détection d'anomalies plateforme — fonction pure, dédiée (jamais un
 * détournement de `teddy-sdk/analytics#detectTrend()`, conçu pour
 * l'adhérence d'UN utilisateur, sémantiquement incompatible avec des
 * métriques globales comme le revenu ou les nouveaux inscrits).
 */
export interface PeriodMetric {
  name: string;
  currentValue: number;
  previousValue: number;
}

export interface DetectedAnomaly {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  direction: "hausse" | "baisse";
}

/** Signale tout écart dépassant `thresholdPercent` (20% par défaut) entre deux périodes, dans un sens ou l'autre. */
export function detectPlatformAnomalies(metrics: PeriodMetric[], thresholdPercent = 20): DetectedAnomaly[] {
  return metrics
    .filter((m) => m.previousValue > 0) // évite une division par zéro — une métrique à 0 sur la période précédente n'a pas de "variation en %" définie
    .map((m) => ({
      metric: m.name,
      currentValue: m.currentValue,
      previousValue: m.previousValue,
      changePercent: Math.round(((m.currentValue - m.previousValue) / m.previousValue) * 100),
      direction: (m.currentValue >= m.previousValue ? "hausse" : "baisse") as "hausse" | "baisse",
    }))
    .filter((a) => Math.abs(a.changePercent) >= thresholdPercent);
}
