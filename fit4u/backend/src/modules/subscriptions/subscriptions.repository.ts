import { BaseRepository } from "../../repositories/base.repository";

export class SubscriptionsRepository extends BaseRepository {
  /** Données minimales nécessaires à la création d'un abonnement (email pour Stripe Customer, stripeCustomerId existant si déjà connu). */
  async findUserBillingInfo(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { email: true, profile: { select: { stripeCustomerId: true } } },
    });
    return { email: user?.email ?? "", stripeCustomerId: user?.profile?.stripeCustomerId ?? null };
  }

  findPlanByKey(key: string) {
    return this.db.subscriptionPlan.findUnique({ where: { key }, include: { prices: true } });
  }

  findPrice(planId: string, provider: string, billingInterval: string) {
    return this.db.subscriptionPrice.findFirst({
      where: { planId, provider, billingInterval, isActive: true },
    });
  }

  findActiveByUser(userId: string) {
    return this.db.subscription.findFirst({
      where: { userId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
      include: { plan: true, payments: { orderBy: { createdAt: "desc" }, take: 10 } },
      orderBy: { createdAt: "desc" },
    });
  }

  findByProviderSubscriptionId(provider: string, providerSubscriptionId: string) {
    return this.db.subscription.findFirst({ where: { provider, providerSubscriptionId } });
  }

  create(data: {
    userId: string;
    planId: string;
    priceId?: string;
    provider: string;
    providerSubscriptionId?: string;
    status: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    trialEndsAt?: Date;
  }) {
    return this.db.subscription.create({ data: data as never });
  }

  updateStatus(id: string, data: {
    status?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date;
  }) {
    return this.db.subscription.update({ where: { id }, data: data as never });
  }

  recordPayment(data: {
    subscriptionId: string;
    provider: string;
    providerPaymentId?: string;
    status: string;
    amountCents: number;
    currency: string;
  }) {
    return this.db.subscriptionPayment.create({ data: data as never });
  }

  updatePaymentByProviderId(providerPaymentId: string, data: { status?: string; refundedAmountCents?: number; refundReason?: string; refundedAt?: Date }) {
    return this.db.subscriptionPayment.updateMany({ where: { providerPaymentId }, data: data as never });
  }

  updateProfileStripeCustomer(userId: string, stripeCustomerId: string) {
    return this.db.profile.update({ where: { userId }, data: { stripeCustomerId } });
  }
}
