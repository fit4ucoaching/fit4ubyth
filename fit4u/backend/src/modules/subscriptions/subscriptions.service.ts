import { NotFoundError, ValidationError } from "../../errors";
import { findOrCreateStripeCustomer } from "../../payments/stripeProvider";
import { getPaymentProvider } from "../../payments/registry";
import { auditLogService } from "../../services/auditLog.service";
import { couponService } from "../../services/coupon.service";
import type { SubscriptionsRepository } from "./subscriptions.repository";
import type { CancelSubscriptionInput, CreateSubscriptionInput } from "./subscriptions.validators";

/**
 * Abonnements digitaux (Volume 7) — SÉPARÉ du module `payments` (Domaine
 * Boutique, `Order`/`Payment`). Toute logique métier passe par
 * `PaymentProvider` (§27), jamais un appel direct à Stripe/PayPal ici.
 */
export class SubscriptionsService {
  constructor(private readonly repository: SubscriptionsRepository) {}

  async create(userId: string, email: string, stripeCustomerId: string | null, input: CreateSubscriptionInput) {
    const plan = await this.repository.findPlanByKey(input.planKey);
    if (!plan || !plan.isActive) {
      throw new NotFoundError("Offre d'abonnement introuvable.");
    }

    const price = await this.repository.findPrice(plan.id, input.provider, input.billingInterval);
    if (!price) {
      throw new ValidationError("Aucun prix disponible pour cette combinaison provider/intervalle.");
    }

    const existing = await this.repository.findActiveByUser(userId);
    if (existing) {
      throw new ValidationError("Un abonnement est déjà actif pour cet utilisateur.");
    }

    if (!price.providerPriceId) {
      throw new ValidationError("Ce prix n'a pas de référence prestataire configurée.");
    }

    // Le coupon est validé (existence/expiration/limites) via le service
    // interne PARTAGÉ avec la Boutique (§23) avant tout appel prestataire —
    // la réduction elle-même sur la facturation récurrente reste appliquée
    // nativement par Stripe (voir `stripeProvider.ts#createSubscription`).
    let couponId: string | undefined;
    if (input.couponCode) {
      const validation = await couponService.validate(input.couponCode, price.amountCents);
      couponId = validation.couponId;
    }

    const provider = getPaymentProvider(input.provider);
    let customerReference = stripeCustomerId ?? "";

    if (input.provider === "stripe") {
      customerReference = await findOrCreateStripeCustomer(email, stripeCustomerId);
      if (customerReference !== stripeCustomerId) {
        await this.repository.updateProfileStripeCustomer(userId, customerReference);
      }
    }

    const result = await provider.createSubscription({
      customerReference,
      providerPriceId: price.providerPriceId,
      couponCode: input.couponCode,
      metadata: { userId, planKey: plan.key },
    });

    if (couponId) {
      await couponService.redeem(couponId);
    }

    const subscription = await this.repository.create({
      userId,
      planId: plan.id,
      priceId: price.id,
      provider: input.provider,
      providerSubscriptionId: result.providerSubscriptionId,
      status: result.status.toUpperCase(),
      currentPeriodStart: result.currentPeriodStart,
      currentPeriodEnd: result.currentPeriodEnd,
    });

    await auditLogService.record({
      performedBy: userId,
      action: "SUBSCRIPTION_CREATED",
      targetType: "Subscription",
      targetId: subscription.id,
      after: { planKey: plan.key, provider: input.provider },
    });

    return subscription;
  }

  /**
   * Annulation (Volume 7 §18) — `cancelAtPeriodEnd` par défaut : les droits
   * restent actifs jusqu'à la fin de la période déjà payée, jamais coupés
   * immédiatement sauf demande explicite (`immediately: true`).
   */
  async cancel(userId: string, input: CancelSubscriptionInput) {
    const subscription = await this.repository.findActiveByUser(userId);
    if (!subscription) {
      throw new NotFoundError("Aucun abonnement actif à annuler.");
    }

    const provider = getPaymentProvider(subscription.provider);
    if (subscription.providerSubscriptionId) {
      await provider.cancelSubscription(subscription.providerSubscriptionId, !input.immediately);
    }

    const updated = await this.repository.updateStatus(subscription.id, {
      status: input.immediately ? "CANCELED" : subscription.status,
      cancelAtPeriodEnd: !input.immediately,
      canceledAt: new Date(),
    });

    await auditLogService.record({
      performedBy: userId,
      action: "SUBSCRIPTION_CANCELED",
      targetType: "Subscription",
      targetId: subscription.id,
      before: { cancelAtPeriodEnd: subscription.cancelAtPeriodEnd },
      after: { immediately: input.immediately },
    });

    return updated;
  }

  getActive(userId: string) {
    return this.repository.findActiveByUser(userId);
  }

  /**
   * Traite les événements Stripe liés aux abonnements (Volume 7 §17) —
   * dispatché depuis `payments.controller.ts#webhook` (un seul endpoint
   * Stripe reçoit tous les événements, quel que soit leur domaine). Ne
   * traite JAMAIS `payment_intent.*` (Domaine Boutique, `payments.service.ts`).
   */
  async handleStripeEvent(event: { type: string; data: { object: Record<string, unknown> } }): Promise<void> {
    switch (event.type) {
      case "customer.subscription.updated": {
        const sub = event.data.object as { id: string; status: string; current_period_start: number; current_period_end: number; cancel_at_period_end: boolean };
        const existing = await this.repository.findByProviderSubscriptionId("stripe", sub.id);
        if (!existing) return; // abonnement créé hors de ce backend (ex. test Stripe Dashboard) — ignoré volontairement
        await this.repository.updateStatus(existing.id, {
          status: sub.status.toUpperCase(),
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };
        const existing = await this.repository.findByProviderSubscriptionId("stripe", sub.id);
        if (!existing) return;
        await this.repository.updateStatus(existing.id, { status: "EXPIRED", canceledAt: new Date() });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as { subscription?: string; payment_intent?: string; amount_paid: number; currency: string };
        if (!invoice.subscription) return;
        const existing = await this.repository.findByProviderSubscriptionId("stripe", invoice.subscription);
        if (!existing) return;
        await this.repository.recordPayment({
          subscriptionId: existing.id,
          provider: "stripe",
          providerPaymentId: invoice.payment_intent,
          status: "PAID",
          amountCents: invoice.amount_paid,
          currency: invoice.currency.toUpperCase(),
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as { subscription?: string };
        if (!invoice.subscription) return;
        const existing = await this.repository.findByProviderSubscriptionId("stripe", invoice.subscription);
        if (!existing) return;
        await this.repository.updateStatus(existing.id, { status: "PAST_DUE" });
        break;
      }
      // default : événement Stripe non lié aux abonnements (ex. payment_intent.*, géré par payments.service.ts) — ignoré silencieusement ici.
    }
  }
}
