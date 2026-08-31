import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "../config/env";

/**
 * Vérification HMAC des webhooks Shopify (Volume 7 §34 : "Vérifier
 * l'authenticité des événements"). Shopify signe le corps brut avec
 * `SHOPIFY_WEBHOOK_SECRET` en base64 — comparaison en temps constant
 * (`timingSafeEqual`) pour éviter une attaque par timing sur la signature.
 */
export function verifyShopifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader || !env.SHOPIFY_WEBHOOK_SECRET) return false;

  const computed = createHmac("sha256", env.SHOPIFY_WEBHOOK_SECRET).update(rawBody).digest("base64");
  const expected = Buffer.from(computed);
  const received = Buffer.from(signatureHeader);

  return expected.length === received.length && timingSafeEqual(expected, received);
}
