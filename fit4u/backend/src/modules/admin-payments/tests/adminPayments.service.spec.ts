import { describe, expect, it, vi } from "vitest";

import { AdminPaymentsService } from "../adminPayments.service";
import type { AdminPaymentsRepository } from "../adminPayments.repository";

/**
 * Analytics tests (Volume 6) — vérifie la logique de calcul MRR/ARR/taux
 * de conversion, indépendamment de Prisma (repository mocké). Le calcul
 * lui-même doit rester déterministe et auditable — pas d'arrondi ou de
 * pondération cachée dans le contrôleur.
 */
function buildService(overview: Awaited<ReturnType<AdminPaymentsRepository["getPaymentsOverview"]>>): AdminPaymentsService {
  const repository = {
    getPaymentsOverview: vi.fn().mockResolvedValue(overview),
  } as unknown as AdminPaymentsRepository;
  return new AdminPaymentsService(repository);
}

describe("AdminPaymentsService.overview", () => {
  it("calcule l'ARR comme 12x le MRR estimé", async () => {
    const service = buildService({
      last30Days: { succeededCount: 10, succeededAmountCents: 100000, failedCount: 1, refundedCount: 0, refundedAmountCents: 0, totalUsers: 500 },
      activeVip: 20,
      subscriptionBreakdown: [{ subscription: "FREE", count: 480 }, { subscription: "PREMIUM", count: 20 }],
      estimatedMrrCents: 100000,
      activeSubscriptionsCount: 20,
    });

    const result = await service.overview();
    expect(result.mrrCents).toBe(100000);
    expect(result.arrCents).toBe(1200000);
  });

  it("calcule le taux de conversion comme (utilisateurs payants / total)", async () => {
    const service = buildService({
      last30Days: { succeededCount: 5, succeededAmountCents: 50000, failedCount: 0, refundedCount: 0, refundedAmountCents: 0, totalUsers: 100 },
      activeVip: 5,
      subscriptionBreakdown: [{ subscription: "FREE", count: 80 }, { subscription: "PREMIUM", count: 15 }, { subscription: "VIP", count: 5 }],
      estimatedMrrCents: 50000,
      activeSubscriptionsCount: 20,
    });

    const result = await service.overview();
    expect(result.conversionRate).toBeCloseTo(0.2); // 20 payants / 100
  });

  it("ne divise jamais par zéro si aucun utilisateur", async () => {
    const service = buildService({
      last30Days: { succeededCount: 0, succeededAmountCents: 0, failedCount: 0, refundedCount: 0, refundedAmountCents: 0, totalUsers: 0 },
      activeVip: 0,
      subscriptionBreakdown: [],
      estimatedMrrCents: 0,
      activeSubscriptionsCount: 0,
    });

    const result = await service.overview();
    expect(Number.isFinite(result.conversionRate)).toBe(true);
  });
});
