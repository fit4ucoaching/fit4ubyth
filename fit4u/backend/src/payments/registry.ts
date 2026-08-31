import { PaymentError } from "../errors";
import { paypalProvider } from "./paypalProvider";
import { stripeProvider } from "./stripeProvider";
import type { PaymentProvider } from "./paymentProvider.interface";

/**
 * Registre des providers (Volume 7 §27) — point unique de résolution par
 * nom. Ajouter Apple Pay/Google Pay natifs (au-delà de leur usage actuel
 * comme méthodes de paiement Stripe) reviendrait à ajouter une entrée ici,
 * jamais à disperser un nouveau `import Stripe from "stripe"` ailleurs.
 */
const PROVIDERS: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  apple_pay: stripeProvider, // Apple Pay = méthode de paiement Stripe (§29)
  google_pay: stripeProvider, // Google Pay = méthode de paiement Stripe (§30)
  paypal: paypalProvider,
};

export function getPaymentProvider(name: string): PaymentProvider {
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new PaymentError(`Prestataire de paiement inconnu : ${name}.`);
  }
  return provider;
}

export * from "./paymentProvider.interface";
