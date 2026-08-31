import { describe, expect, it, vi } from "vitest";

vi.mock("../adminAnalytics.repository");
vi.mock("../../../ai/ceo/ceo.repository");

import { AdminAnalyticsRepository } from "../adminAnalytics.repository";
import { CeoRepository } from "../../../ai/ceo/ceo.repository";
import { AdminAnalyticsService } from "../adminAnalytics.service";

/**
 * Tests Analytics BI — vérifie la normalisation bigint/Date → number/ISO
 * (Postgres `COUNT`/`SUM` renvoient des `bigint`, jamais directement
 * sérialisables en JSON sans cette conversion), et le calcul du taux de
 * rétention.
 */
describe("AdminAnalyticsService — normalisation des séries temporelles", () => {
  it("convertit bigint en number et Date en chaîne ISO (jour)", async () => {
    vi.mocked(AdminAnalyticsRepository.prototype.getUserGrowthTrend).mockResolvedValue([
      { day: new Date("2026-08-01T00:00:00Z"), count: BigInt(12) },
      { day: new Date("2026-08-02T00:00:00Z"), count: BigInt(7) },
    ]);

    const service = new AdminAnalyticsService();
    const result = await service.getUserGrowth(30);

    expect(result).toEqual([
      { day: "2026-08-01", value: 12 },
      { day: "2026-08-02", value: 7 },
    ]);
    expect(typeof result[0]?.value).toBe("number"); // jamais un bigint résiduel (non sérialisable tel quel en JSON)
  });

  it("retourne un tableau vide si aucune donnée sur la période, jamais une erreur", async () => {
    vi.mocked(AdminAnalyticsRepository.prototype.getRevenueTrend).mockResolvedValue([]);
    const service = new AdminAnalyticsService();

    expect(await service.getRevenueTrend(30)).toEqual([]);
  });
});

describe("AdminAnalyticsService.getRetentionCohorts", () => {
  it("calcule le taux de rétention comme retained/cohortSize", async () => {
    vi.mocked(AdminAnalyticsRepository.prototype.getWeeklyRetentionCohorts).mockResolvedValue([
      { cohort_week: new Date("2026-07-06T00:00:00Z"), cohort_size: BigInt(100), retained_count: BigInt(35) },
    ]);

    const service = new AdminAnalyticsService();
    const result = await service.getRetentionCohorts(8);

    expect(result[0]).toMatchObject({ cohortSize: 100, retainedCount: 35, retentionRate: 0.35 });
  });

  it("ne divise jamais par zéro pour une cohorte vide", async () => {
    vi.mocked(AdminAnalyticsRepository.prototype.getWeeklyRetentionCohorts).mockResolvedValue([
      { cohort_week: new Date("2026-07-06T00:00:00Z"), cohort_size: BigInt(0), retained_count: BigInt(0) },
    ]);

    const service = new AdminAnalyticsService();
    const result = await service.getRetentionCohorts(8);

    expect(result[0]?.retentionRate).toBe(0);
    expect(Number.isFinite(result[0]?.retentionRate)).toBe(true);
  });
});

describe("AdminAnalyticsService.getTopPrograms", () => {
  it("réutilise CeoRepository plutôt que de dupliquer la requête (Volume 8, DRY)", async () => {
    const spy = vi.mocked(CeoRepository.prototype.getTopPerformingPrograms).mockResolvedValue([]);
    const service = new AdminAnalyticsService();

    await service.getTopPrograms(5);

    expect(spy).toHaveBeenCalledWith(5);
  });
});
