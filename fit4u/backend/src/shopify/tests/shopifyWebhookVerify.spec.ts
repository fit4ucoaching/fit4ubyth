import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../config/env", () => ({ env: { SHOPIFY_WEBHOOK_SECRET: "test_secret" } }));

import { verifyShopifyWebhookSignature } from "../shopifyWebhookVerify";

/** Tests webhooks Shopify (Volume 7 §49) — signature valide/invalide, en-tête manquant. */
describe("verifyShopifyWebhookSignature", () => {
  const rawBody = Buffer.from(JSON.stringify({ id: 123, title: "Produit Test" }));

  it("accepte une signature HMAC correcte", () => {
    const validSignature = createHmac("sha256", "test_secret").update(rawBody).digest("base64");
    expect(verifyShopifyWebhookSignature(rawBody, validSignature)).toBe(true);
  });

  it("rejette une signature invalide", () => {
    expect(verifyShopifyWebhookSignature(rawBody, "signature-falsifiee")).toBe(false);
  });

  it("rejette un en-tête de signature absent", () => {
    expect(verifyShopifyWebhookSignature(rawBody, undefined)).toBe(false);
  });

  it("rejette une signature valide pour un AUTRE corps (détecte une altération du payload)", () => {
    const signatureForOtherBody = createHmac("sha256", "test_secret")
      .update(Buffer.from(JSON.stringify({ id: 999 })))
      .digest("base64");
    expect(verifyShopifyWebhookSignature(rawBody, signatureForOtherBody)).toBe(false);
  });
});
