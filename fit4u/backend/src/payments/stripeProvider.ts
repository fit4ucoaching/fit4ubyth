import Stripe from "stripe";

import { env } from "../config/env";
import type { CheckoutResult, PaymentProvider, SubscriptionResult } from "./paymentProvider.interface";

const stripe = new Stripe(env.STRIPE_SECRET, { apiVersion: "2024-06-20" });

/**
 * Implémentation Stripe de `PaymentProvider` (Volume 7 §14, §27). Apple Pay
 * et Google Pay passent également par cette implémentation — ce sont des
 * méthodes de paiement Stripe (`automatic_payment_methods`), jamais une
 * logique métier séparée (§29-30 : "Ne jamais créer une logique métier
 * spécifique inutilement couplée à Apple Pay/Google Pay").
 */
export const stripeProvider: PaymentProvider = {
  name: "stripe",

  async createCheckout({ amountCents, currency, metadata }): Promise<CheckoutResult> {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { provider: "stripe", reference: intent.client_secret ?? intent.id };
  },

  async createSubscription({ customerReference, providerPriceId, trialDays, couponCode, metadata }): Promise<SubscriptionResult> {
    // Le coupon est appliqué nativement côté Stripe (impacte chaque facture
    // récurrente future, pas seulement le premier paiement) — suppose qu'un
    // Coupon Stripe du même `code` existe côté Dashboard Stripe, en miroir
    // du catalogue interne `Coupon` (Volume 7 §13 : catalogue indépendant
    // du prestataire, mais la RÉDUCTION récurrente reste une primitive
    // propre à chaque prestataire, non reproductible génériquement ici).
    const subscription = await stripe.subscriptions.create({
      customer: customerReference,
      items: [{ price: providerPriceId }],
      trial_period_days: trialDays,
      coupon: couponCode,
      metadata,
    });
    return {
      provider: "stripe",
      providerSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  },

  async cancelSubscription(providerSubscriptionId, cancelAtPeriodEnd): Promise<void> {
    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update(providerSubscriptionId, { cancel_at_period_end: true });
    } else {
      await stripe.subscriptions.cancel(providerSubscriptionId);
    }
  },

  async refundPayment(providerTransactionId, amountCents, reason): Promise<void> {
    await stripe.refunds.create({
      payment_intent: providerTransactionId,
      amount: amountCents,
      reason: reason as Stripe.RefundCreateParams.Reason | undefined,
    });
  },

  async getPaymentStatus(providerTransactionId): Promise<string> {
    const intent = await stripe.paymentIntents.retrieve(providerTransactionId);
    return intent.status;
  },
};

/** Récupère (ou crée) le client Stripe associé à un utilisateur — nécessaire à `createSubscription`. */
export async function findOrCreateStripeCustomer(email: string, existingCustomerId?: string | null): Promise<string> {
  if (existingCustomerId) return existingCustomerId;
  const customer = await stripe.customers.create({ email });
  return customer.id;
}

export { stripe };
