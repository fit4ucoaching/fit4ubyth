import { CeoRepository } from "../../ai/ceo/ceo.repository";
import { AdminAnalyticsRepository } from "./adminAnalytics.repository";

const repository = new AdminAnalyticsRepository();
const ceoRepository = new CeoRepository(); // réutilise getTopPerformingPrograms plutôt que de dupliquer la requête

/** Normalise les résultats `$queryRaw` (bigint/Date bruts) en format prêt pour un graphique Recharts (clé "day" en ISO, valeurs en number). */
function toChartSeries<T extends { day: Date }>(rows: T[], valueKey: keyof T): { day: string; value: number }[] {
  return rows.map((r) => ({ day: r.day.toISOString().slice(0, 10), value: Number(r[valueKey]) }));
}

export class AdminAnalyticsService {
  async getUserGrowth(days: number) {
    return toChartSeries(await repository.getUserGrowthTrend(days), "count");
  }

  async getRevenueTrend(days: number) {
    return toChartSeries(await repository.getRevenueTrend(days), "total_cents");
  }

  async getWorkoutEngagement(days: number) {
    return toChartSeries(await repository.getWorkoutEngagementTrend(days), "count");
  }

  async getTeddyUsage(days: number) {
    return toChartSeries(await repository.getTeddyUsageTrend(days), "count");
  }

  async getRetentionCohorts(weeksBack: number) {
    const rows = await repository.getWeeklyRetentionCohorts(weeksBack);
    return rows.map((r) => ({
      week: r.cohort_week.toISOString().slice(0, 10),
      cohortSize: Number(r.cohort_size),
      retainedCount: Number(r.retained_count),
      retentionRate: Number(r.cohort_size) > 0 ? Number(r.retained_count) / Number(r.cohort_size) : 0,
    }));
  }

  getTopExercises(limit: number) {
    return repository.getTopExercises(limit);
  }

  getTopPrograms(limit: number) {
    return ceoRepository.getTopPerformingPrograms(limit);
  }
}
