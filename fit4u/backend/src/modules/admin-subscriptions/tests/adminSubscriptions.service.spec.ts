import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../payments/registry", () => ({ getPaymentProvider: vi.fn() }));
vi.mock("../../../services/auditLog.service", () => ({ auditLogService: { record: vi.fn() } }));

import { getPaymentProvider } from "../../../payments/registry";
import { AdminSubscriptionsService } from "../adminSubscriptions.service";
import type { AdminSubscriptionsRepository } from "../adminSubscriptions.repository";

/**
 * Tests admin-subscriptions — vérifie surtout que l'annulation admin passe
 * TOUJOURS par le PaymentProvider réel avant de toucher la base (jamais un
 * raccourci qui désynchroniserait Fit4U et le prestataire, Stripe
 * continuant de facturer un abonnement que Fit4U croit annulé).
 */
function buildRepositoryMock(overrides: Partial<AdminSubscriptionsRepository> = {}): AdminSubscriptionsRepository {
  return {
    listPlans: vi.fn(),
    createPlan: vi.fn().mockResolvedValue({ id: "plan1" }),
    updatePlan: vi.fn(),
    findPlanById: vi.fn().mockResolvedValue({ id: "plan1", name: "Fit4U Premium", isActive: true }),
    createPrice: vi.fn().mockResolvedValue({ id: "price1" }),
    listSubscriptions: vi.fn(),
    findSubscriptionById: vi.fn().mockResolvedValue({
      id: "sub1", provider: "stripe", providerSubscriptionId: "sub_ext_1", status: "ACTIVE",
    }),
    updateSubscriptionStatus: vi.fn().mockResolvedValue({ id: "sub1", status: "ACTIVE", cancelAtPeriodEnd: true }),
    ...overrides,
  } as unknown as AdminSubscriptionsRepository;
}

describe("AdminSubscriptionsService.cancelSubscription", () => {
  beforeEach(() => vi.clearAllMocks());

  it("appelle le PaymentProvider AVANT de mettre à jour la base (jamais l'inverse)", async () => {
    const callOrder: string[] = [];
    const mockProvider = { cancelSubscription: vi.fn().mockImplementation(async () => { callOrder.push("provider"); }) };
    vi.mocked(getPaymentProvider).mockReturnValue(mockProvider as never);
    const repository = buildRepositoryMock({
      updateSubscriptionStatus: vi.fn().mockImplementation(async () => { callOrder.push("db"); return { id: "sub1" }; }) as never,
    });
    const service = new AdminSubscriptionsService(repository);

    await service.cancelSubscription("admin1", "sub1", { immediately: false });

    expect(callOrder).toEqual(["provider", "db"]);
  });

  it("annulation en fin de période par défaut — cancelAtPeriodEnd=true transmis au provider", async () => {
    const mockProvider = { cancelSubscription: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(getPaymentProvider).mockReturnValue(mockProvider as never);
    const repository = buildRepositoryMock();
    const service = new AdminSubscriptionsService(repository);

    await service.cancelSubscription("admin1", "sub1", { immediately: false });

    expect(mockProvider.cancelSubscription).toHaveBeenCalledWith("sub_ext_1", true);
  });

  it("refuse d'annuler un abonnement introuvable", async () => {
    const repository = buildRepositoryMock({ findSubscriptionById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminSubscriptionsService(repository);

    await expect(service.cancelSubscription("admin1", "inexistant", { immediately: false })).rejects.toThrow("introuvable");
  });
});

describe("AdminSubscriptionsService.updatePlan", () => {
  it("refuse de modifier une offre introuvable", async () => {
    const repository = buildRepositoryMock({ findPlanById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminSubscriptionsService(repository);

    await expect(service.updatePlan("admin1", "inexistant", { isActive: false })).rejects.toThrow("introuvable");
  });
});
