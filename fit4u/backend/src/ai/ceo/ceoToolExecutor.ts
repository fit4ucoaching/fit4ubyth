import { detectPlatformAnomalies } from "./ceoAnomalyDetection";
import { CeoRepository } from "./ceo.repository";

const repository = new CeoRepository();

/**
 * Dispatch des outils CEO déclarés dans `@fit4u/teddy-sdk/ceo` — même
 * séparation stricte que `ai/tools/toolExecutor.ts` (Volume 5) : le SDK
 * ne connaît que le NOM et le SCHÉMA des outils, jamais leur exécution.
 */
export async function executeCeoTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "GetKPISummary":
      return repository.getKPISummary();

    case "DetectAnomalies": {
      const periodDays = typeof args.periodDays === "number" ? args.periodDays : 7;
      const now = new Date();
      const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

      const [currentRevenue, previousRevenue, currentWorkouts, previousWorkouts, currentNewUsers, previousNewUsers] = await Promise.all([
        repository.getRevenueCents(periodStart, now),
        repository.getRevenueCents(previousPeriodStart, periodStart),
        repository.getCompletedWorkoutsCount(periodStart, now),
        repository.getCompletedWorkoutsCount(previousPeriodStart, periodStart),
        repository.getNewUsersCount(periodStart, now),
        repository.getNewUsersCount(previousPeriodStart, periodStart),
      ]);

      const anomalies = detectPlatformAnomalies([
        { name: "Revenu (centimes)", currentValue: currentRevenue, previousValue: previousRevenue },
        { name: "Séances complétées", currentValue: currentWorkouts, previousValue: previousWorkouts },
        { name: "Nouveaux utilisateurs", currentValue: currentNewUsers, previousValue: previousNewUsers },
      ]);

      return { periodDays, anomalies, anomalyCount: anomalies.length };
    }

    case "GetChurnRiskUsers": {
      const inactivityDays = typeof args.inactivityDays === "number" ? args.inactivityDays : 14;
      return repository.getChurnRiskUsers(inactivityDays);
    }

    case "GetTopPerformingPrograms": {
      const limit = typeof args.limit === "number" ? args.limit : 5;
      return repository.getTopPerformingPrograms(limit);
    }

    default:
      return { error: `Outil CEO inconnu : ${name}` };
  }
}
