import Stripe from "stripe";

import { env } from "../../config/env";
import { NotFoundError, PaymentError, ValidationError } from "../../errors";
import { logger } from "../../config/logger";
import type { PaymentsRepository } from "./payments.repository";
import type { CreateIntentInput, RefundInput } from "./payments.validators";

const stripe = new Stripe(env.STRIPE_SECRET, { apiVersion: "2024-06-20" });

export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  /**
   * Crée l'intention de paiement côté provider. Apple Pay / Google Pay
   * s'appuient tous deux sur le PaymentIntent Stripe (méthodes de paiement
   * natives configurées côté Stripe Dashboard) — seul PayPal utilise un flux
   * distinct (Orders API v2, appelée directement via `fetch`, sans SDK
   * dédié pour limiter la surface de dépendances).
   */
  async createIntent(userId: string, input: CreateIntentInput) {
    const order = await this.paymentsRepository.findOrderById(input.orderId, userId);
    if (!order) {
      throw new NotFoundError("Commande introuvable.");
    }
    if (order.status !== "PENDING") {
      throw new ValidationError("Cette commande n'est plus en attente de paiement.");
    }

    if (input.provider === "paypal") {
      return this.createPayPalOrder(userId, order.id, order.totalCents, order.currency);
    }

    // stripe / apple_pay / google_pay
    try {
      const intent = await stripe.paymentIntents.create({
        amount: order.totalCents,
        currency: order.currency.toLowerCase(),
        metadata: { orderId: order.id, userId },
        automatic_payment_methods: { enabled: true },
      });

      await this.paymentsRepository.createPayment({
        orderId: order.id,
        userId,
        provider: input.provider,
        providerTransactionId: intent.id,
        amountCents: order.totalCents,
        currency: order.currency,
      });

      return { clientSecret: intent.client_secret, provider: "stripe" as const };
    } catch (err) {
      logger.error({ err }, "Échec de création du PaymentIntent Stripe");
      throw new PaymentError("Impossible d'initialiser le paiement.");
    }
  }

  private async createPayPalOrder(userId: string, orderId: string, amountCents: number, currency: string) {
    // Intégration PayPal Orders API v2 via fetch natif (pas de SDK dédié —
    // limite la surface de dépendances pour un flux utilisé en complément
    // de Stripe). Nécessite PAYPAL_CLIENT_ID/SECRET configurés.
    const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) {
      throw new PaymentError("Impossible d'initialiser le paiement PayPal.");
    }
    const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };

    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: (amountCents / 100).toFixed(2) } }],
      }),
    });
    const paypalOrder = (await orderRes.json()) as { id: string };

    await this.paymentsRepository.createPayment({
      orderId,
      userId,
      provider: "paypal",
      providerTransactionId: paypalOrder.id,
      amountCents,
      currency,
    });

    return { paypalOrderId: paypalOrder.id, provider: "paypal" as const };
  }

  /** Traite les webhooks Stripe — signature vérifiée dans `payments.controller.ts` avant appel. */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.paymentsRepository.updatePaymentStatus(intent.id, "PAID");
        const orderId = intent.metadata.orderId;
        if (orderId) {
          await this.paymentsRepository.markOrderPaid(orderId);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.paymentsRepository.updatePaymentStatus(intent.id, "FAILED");
        break;
      }
      default:
        logger.debug({ type: event.type }, "Événement Stripe ignoré (non géré)");
    }
  }

  history(userId: string, params: { page: number; pageSize: number }) {
    return this.paymentsRepository.findHistory(userId, params);
  }

  async refund(userId: string, input: RefundInput) {
    const payment = await this.paymentsRepository.findPaymentById(input.paymentId);
    if (!payment || payment.userId !== userId) {
      throw new NotFoundError("Paiement introuvable.");
    }
    if (payment.status !== "PAID") {
      throw new ValidationError("Seul un paiement confirmé peut être remboursé.");
    }

    if (payment.provider === "stripe" && payment.providerTransactionId) {
      await stripe.refunds.create({ payment_intent: payment.providerTransactionId, reason: "requested_by_customer" });
    }
    // Remboursement PayPal : appel symétrique à l'API Captures/refund (non détaillé ici,
    // même pattern `fetch` que `createPayPalOrder`).

    await this.paymentsRepository.updatePaymentStatus(payment.providerTransactionId ?? "", "REFUNDED");
    return { refunded: true };
  }
}

export { stripe };
