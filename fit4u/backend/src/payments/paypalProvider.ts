import { env } from "../config/env";
import { PaymentError } from "../errors";
import type { CheckoutResult, PaymentProvider, SubscriptionResult } from "./paymentProvider.interface";

const PAYPAL_API_BASE = "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new PaymentError("Impossible de s'authentifier auprès de PayPal.");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Implémentation PayPal de `PaymentProvider` (Volume 7 §28). "Les références
 * PayPal restent séparées des références Stripe" — `provider: "paypal"` sur
 * chaque `Payment`/`Subscription` garantit qu'un identifiant PayPal n'est
 * jamais interprété comme un identifiant Stripe ailleurs dans le code.
 * Appelée via `fetch` natif (Orders API v2 / Subscriptions API v1), pas de
 * SDK dédié pour limiter la surface de dépendances.
 */
export const paypalProvider: PaymentProvider = {
  name: "paypal",

  async createCheckout({ amountCents, currency }): Promise<CheckoutResult> {
    const accessToken = await getAccessToken();
    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: (amountCents / 100).toFixed(2) } }],
      }),
    });
    if (!res.ok) throw new PaymentError("Impossible de créer la commande PayPal.");
    const order = (await res.json()) as { id: string };
    return { provider: "paypal", reference: order.id };
  },

  async createSubscription({ providerPriceId, metadata, couponCode }): Promise<SubscriptionResult> {
    // PayPal ne propose pas d'équivalent direct à un "coupon" appliqué à un
    // abonnement récurrent via l'API Subscriptions — un `couponCode` fourni
    // ici est donc actuellement ignoré côté PayPal (validation/limites
    // restent appliquées côté interne par `couponService`, voir
    // `subscriptions.service.ts`). Point d'extension documenté plutôt que
    // simulé : voir docs/subscriptions/paypal-coupons.md.
    void couponCode;
    const accessToken = await getAccessToken();
    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: providerPriceId, custom_id: metadata.userId }),
    });
    if (!res.ok) throw new PaymentError("Impossible de créer l'abonnement PayPal.");
    const subscription = (await res.json()) as { id: string; status: string };
    return { provider: "paypal", providerSubscriptionId: subscription.id, status: subscription.status };
  },

  async cancelSubscription(providerSubscriptionId): Promise<void> {
    // PayPal n'a pas d'équivalent natif à `cancel_at_period_end` — l'annulation
    // est toujours immédiate côté PayPal. `cancelAtPeriodEnd` est alors géré
    // applicativement (voir `subscriptions.service.ts` : les droits sont
    // conservés jusqu'à `currentPeriodEnd` déjà connu localement, sans
    // attendre de confirmation PayPal supplémentaire).
    const accessToken = await getAccessToken();
    await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${providerSubscriptionId}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Annulation demandée par l'utilisateur" }),
    });
  },

  async refundPayment(providerTransactionId, amountCents): Promise<void> {
    const accessToken = await getAccessToken();
    await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${providerTransactionId}/refund`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: amountCents ? JSON.stringify({ amount: { value: (amountCents / 100).toFixed(2), currency_code: "EUR" } }) : undefined,
    });
  },

  async getPaymentStatus(providerTransactionId): Promise<string> {
    const accessToken = await getAccessToken();
    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${providerTransactionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const order = (await res.json()) as { status: string };
    return order.status;
  },
};
