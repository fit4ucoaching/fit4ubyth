import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../payments/stripeProvider", () => ({
  findOrCreateStripeCustomer: vi.fn().mockResolvedValue("cus_123"),
}));
vi.mock("../../../payments/registry", () => ({
  getPaymentProvider: vi.fn(),
}));
vi.mock("../../../services/auditLog.service", () => ({
  auditLogService: { record: vi.fn() },
}));
vi.mock("../../../services/coupon.service", () => ({
  couponService: { validate: vi.fn(), redeem: vi.fn() },
}));

import { getPaymentProvider } from "../../../payments/registry";
import { SubscriptionsService } from "../subscriptions.service";
import type { SubscriptionsRepository } from "../subscriptions.repository";

/**
 * Tests paiement/abonnement (Volume 7 §49) — renouvellement (webhook,
 * couvert par `handleStripeEvent`), annulation (`cancelAtPeriodEnd` par
 * défaut), expiration. La création elle-même est testée via un
 * `PaymentProvider` mocké — jamais un vrai appel Stripe dans les tests.
 */
function buildRepositoryMock(overrides: Partial<SubscriptionsRepository> = {}): SubscriptionsRepository {
  return {
    findPlanByKey: vi.fn().mockResolvedValue({ id: "plan1", key: "FIT4U_PREMIUM_MONTHLY", isActive: true }),
    findPrice: vi.fn().mockResolvedValue({ id: "price1", providerPriceId: "price_stripe_1", amountCents: 999 }),
    findActiveByUser: vi.fn().mockResolvedValue(null),
    findByProviderSubscriptionId: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: "sub1" }),
    updateStatus: vi.fn().mockResolvedValue({ id: "sub1", status: "CANCELED" }),
    recordPayment: vi.fn(),
    updatePaymentByProviderId: vi.fn(),
    updateProfileStripeCustomer: vi.fn(),
    findUserBillingInfo: vi.fn(),
    ...overrides,
  } as unknown as SubscriptionsRepository;
}

describe("SubscriptionsService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("crée un abonnement via le PaymentProvider résolu par nom", async () => {
    const mockProvider = {
      createSubscription: vi.fn().mockResolvedValue({ provider: "stripe", providerSubscriptionId: "sub_ext_1", status: "active" }),
    };
    vi.mocked(getPaymentProvider).mockReturnValue(mockProvider as never);
    const repository = buildRepositoryMock();
    const service = new SubscriptionsService(repository);

    await service.create("user1", "user@fit4u.app", null, {
      planKey: "FIT4U_PREMIUM_MONTHLY", provider: "stripe", billingInterval: "MONTH",
    });

    expect(mockProvider.createSubscription).toHaveBeenCalledOnce();
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ provider: "stripe", status: "ACTIVE" }));
  });

  it("refuse de créer un second abonnement si un abonnement actif existe déjà", async () => {
    const repository = buildRepositoryMock({ findActiveByUser: vi.fn().mockResolvedValue({ id: "existing" }) } as never);
    const service = new SubscriptionsService(repository);

    await expect(
      service.create("user1", "user@fit4u.app", null, { planKey: "FIT4U_PREMIUM_MONTHLY", provider: "stripe", billingInterval: "MONTH" }),
    ).rejects.toThrow("déjà actif");
  });

  it("refuse une offre introuvable ou inactive", async () => {
    const repository = buildRepositoryMock({ findPlanByKey: vi.fn().mockResolvedValue(null) } as never);
    const service = new SubscriptionsService(repository);

    await expect(
      service.create("user1", "user@fit4u.app", null, { planKey: "INEXISTANT", provider: "stripe", billingInterval: "MONTH" }),
    ).rejects.toThrow("introuvable");
  });
});

describe("SubscriptionsService.cancel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("annulation par défaut : cancelAtPeriodEnd=true, les droits ne sont PAS coupés immédiatement", async () => {
    const mockProvider = { cancelSubscription: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(getPaymentProvider).mockReturnValue(mockProvider as never);
    const repository = buildRepositoryMock({
      findActiveByUser: vi.fn().mockResolvedValue({ id: "sub1", provider: "stripe", providerSubscriptionId: "sub_ext_1", status: "ACTIVE", cancelAtPeriodEnd: false }),
    } as never);
    const service = new SubscriptionsService(repository);

    await service.cancel("user1", { immediately: false });

    expect(mockProvider.cancelSubscription).toHaveBeenCalledWith("sub_ext_1", true);
    expect(repository.updateStatus).toHaveBeenCalledWith("sub1", expect.objectContaining({ cancelAtPeriodEnd: true, status: "ACTIVE" }));
  });

  it("annulation immédiate explicite : coupe l'accès tout de suite (statut CANCELED)", async () => {
    const mockProvider = { cancelSubscription: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(getPaymentProvider).mockReturnValue(mockProvider as never);
    const repository = buildRepositoryMock({
      findActiveByUser: vi.fn().mockResolvedValue({ id: "sub1", provider: "stripe", providerSubscriptionId: "sub_ext_1", status: "ACTIVE", cancelAtPeriodEnd: false }),
    } as never);
    const service = new SubscriptionsService(repository);

    await service.cancel("user1", { immediately: true });

    expect(mockProvider.cancelSubscription).toHaveBeenCalledWith("sub_ext_1", false);
    expect(repository.updateStatus).toHaveBeenCalledWith("sub1", expect.objectContaining({ status: "CANCELED", cancelAtPeriodEnd: false }));
  });

  it("refuse d'annuler s'il n'y a aucun abonnement actif", async () => {
    const repository = buildRepositoryMock({ findActiveByUser: vi.fn().mockResolvedValue(null) } as never);
    const service = new SubscriptionsService(repository);

    await expect(service.cancel("user1", { immediately: false })).rejects.toThrow("Aucun abonnement actif");
  });
});

describe("SubscriptionsService.handleStripeEvent — renouvellement et expiration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("customer.subscription.deleted → statut EXPIRED (Volume 7 §17)", async () => {
    const repository = buildRepositoryMock({
      findByProviderSubscriptionId: vi.fn().mockResolvedValue({ id: "sub1" }),
    } as never);
    const service = new SubscriptionsService(repository);

    await service.handleStripeEvent({ type: "customer.subscription.deleted", data: { object: { id: "sub_ext_1" } } });

    expect(repository.updateStatus).toHaveBeenCalledWith("sub1", expect.objectContaining({ status: "EXPIRED" }));
  });

  it("invoice.paid → enregistre un SubscriptionPayment (renouvellement réussi)", async () => {
    const repository = buildRepositoryMock({
      findByProviderSubscriptionId: vi.fn().mockResolvedValue({ id: "sub1" }),
    } as never);
    const service = new SubscriptionsService(repository);

    await service.handleStripeEvent({
      type: "invoice.paid",
      data: { object: { subscription: "sub_ext_1", payment_intent: "pi_1", amount_paid: 999, currency: "eur" } },
    });

    expect(repository.recordPayment).toHaveBeenCalledWith(expect.objectContaining({ subscriptionId: "sub1", status: "PAID", amountCents: 999 }));
  });

  it("invoice.payment_failed → statut PAST_DUE (Volume 7 §17)", async () => {
    const repository = buildRepositoryMock({
      findByProviderSubscriptionId: vi.fn().mockResolvedValue({ id: "sub1" }),
    } as never);
    const service = new SubscriptionsService(repository);

    await service.handleStripeEvent({ type: "invoice.payment_failed", data: { object: { subscription: "sub_ext_1" } } });

    expect(repository.updateStatus).toHaveBeenCalledWith("sub1", { status: "PAST_DUE" });
  });

  it("ignore silencieusement un événement pour un abonnement inconnu du backend", async () => {
    const repository = buildRepositoryMock({ findByProviderSubscriptionId: vi.fn().mockResolvedValue(null) } as never);
    const service = new SubscriptionsService(repository);

    await expect(
      service.handleStripeEvent({ type: "customer.subscription.deleted", data: { object: { id: "sub_unknown" } } }),
    ).resolves.not.toThrow();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});
