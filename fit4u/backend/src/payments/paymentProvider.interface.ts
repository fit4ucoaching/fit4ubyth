/**
 * Interface commune à tous les prestataires de paiement (Volume 7 §27).
 * "Ne jamais disperser les appels fournisseurs dans toute l'application" —
 * `payments.service.ts` et `subscriptions.service.ts` n'appellent JAMAIS
 * Stripe/PayPal directement, uniquement à travers cette interface.
 */
export interface CheckoutResult {
  provider: string;
  /** Stripe : client_secret d'un PaymentIntent. PayPal : identifiant de commande PayPal. */
  reference: string;
}

export interface SubscriptionResult {
  provider: string;
  providerSubscriptionId: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface PaymentProvider {
  readonly name: string;

  createCheckout(params: { amountCents: number; currency: string; metadata: Record<string, string> }): Promise<CheckoutResult>;

  createSubscription(params: {
    customerReference: string;
    providerPriceId: string;
    trialDays?: number;
    couponCode?: string;
    metadata: Record<string, string>;
  }): Promise<SubscriptionResult>;

  cancelSubscription(providerSubscriptionId: string, cancelAtPeriodEnd: boolean): Promise<void>;

  refundPayment(providerTransactionId: string, amountCents?: number, reason?: string): Promise<void>;

  getPaymentStatus(providerTransactionId: string): Promise<string>;
}
