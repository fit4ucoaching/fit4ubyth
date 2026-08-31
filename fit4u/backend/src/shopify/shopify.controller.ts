import type { Request, Response } from "express";

import { ValidationError } from "../errors";
import { shopifyService } from "./shopify.service";
import { verifyShopifyWebhookSignature } from "./shopifyWebhookVerify";

export class ShopifyController {
  /**
   * Corps monté en `express.raw()` (voir `app.ts`), comme le webhook Stripe
   * — la signature HMAC Shopify porte sur les octets bruts.
   */
  webhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["x-shopify-hmac-sha256"];
    if (typeof signature !== "string" || !verifyShopifyWebhookSignature(req.body as Buffer, signature)) {
      throw new ValidationError("Signature de webhook Shopify invalide.");
    }

    const topic = req.headers["x-shopify-topic"];
    const eventId = req.headers["x-shopify-webhook-id"];
    if (typeof topic !== "string" || typeof eventId !== "string") {
      throw new ValidationError("En-têtes de webhook Shopify manquants.");
    }

    const payload = JSON.parse((req.body as Buffer).toString("utf-8"));
    await shopifyService.handleWebhook(topic, eventId, payload);

    res.status(200).json({ received: true });
  };
}
