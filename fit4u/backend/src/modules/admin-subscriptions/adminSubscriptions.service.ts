import { NotFoundError } from "../../errors";
import { getPaymentProvider } from "../../payments/registry";
import { auditLogService } from "../../services/auditLog.service";
import type { AdminSubscriptionsRepository } from "./adminSubscriptions.repository";
import type {
  AdminCancelSubscriptionInput,
  CreatePlanInput,
  CreatePriceInput,
  ListSubscriptionsQuery,
  UpdatePlanInput,
} from "./adminSubscriptions.validators";

/**
 * Gestion admin des abonnements (Volume 6 §"BackOffice — Abonnements",
 * débloquée par le schéma Volume 7). Toute annulation admin passe par le
 * même `PaymentProvider` que l'annulation self-service — jamais un
 * raccourci qui mettrait à jour uniquement la base sans notifier le
 * prestataire (créerait une divergence : Stripe continuerait de facturer
 * un abonnement que Fit4U croit annulé).
 */
export class AdminSubscriptionsService {
  constructor(private readonly repository: AdminSubscriptionsRepository) {}

  listPlans() {
    return this.repository.listPlans();
  }

  async createPlan(adminId: string, input: CreatePlanInput) {
    const plan = await this.repository.createPlan(input);
    await auditLogService.record({ performedBy: adminId, action: "SUBSCRIPTION_PLAN_CREATED", targetType: "SubscriptionPlan", targetId: plan.id, after: input });
    return plan;
  }

  async updatePlan(adminId: string, planId: string, input: UpdatePlanInput) {
    const before = await this.repository.findPlanById(planId);
    if (!before) throw new NotFoundError("Offre introuvable.");
    const updated = await this.repository.updatePlan(planId, input);
    await auditLogService.record({
      performedBy: adminId, action: "SUBSCRIPTION_PLAN_UPDATED", targetType: "SubscriptionPlan", targetId: planId,
      before: { name: before.name, isActive: before.isActive }, after: input,
    });
    return updated;
  }

  async addPrice(adminId: string, planId: string, input: CreatePriceInput) {
    const plan = await this.repository.findPlanById(planId);
    if (!plan) throw new NotFoundError("Offre introuvable.");
    const price = await this.repository.createPrice(planId, input);
    await auditLogService.record({ performedBy: adminId, action: "SUBSCRIPTION_PRICE_CREATED", targetType: "SubscriptionPrice", targetId: price.id, after: input });
    return price;
  }

  listSubscriptions(query: ListSubscriptionsQuery) {
    return this.repository.listSubscriptions(query);
  }

  /** Annulation déclenchée par un administrateur (ex. demande support, litige) — jamais silencieuse côté prestataire. */
  async cancelSubscription(adminId: string, subscriptionId: string, input: AdminCancelSubscriptionInput) {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription) throw new NotFoundError("Abonnement introuvable.");

    if (subscription.providerSubscriptionId) {
      const provider = getPaymentProvider(subscription.provider);
      await provider.cancelSubscription(subscription.providerSubscriptionId, !input.immediately);
    }

    const updated = await this.repository.updateSubscriptionStatus(subscriptionId, {
      status: input.immediately ? "CANCELED" : subscription.status,
      cancelAtPeriodEnd: !input.immediately,
      canceledAt: new Date(),
    });

    await auditLogService.record({
      performedBy: adminId,
      action: "ADMIN_CHANGED_SUBSCRIPTION",
      targetType: "Subscription",
      targetId: subscriptionId,
      before: { status: subscription.status },
      after: { immediately: input.immediately, reason: input.reason },
    });

    return updated;
  }
}
