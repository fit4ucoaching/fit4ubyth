import { logger } from "../config/logger";
import { webhookEventService } from "../services/webhookEvent.service";
import { shopifyClient, type ShopifyOrder, type ShopifyProduct } from "./shopify.client";
import { ShopifyRepository } from "./shopify.repository";

const repository = new ShopifyRepository();

const ORDER_STATUS_MAP: Record<string, string> = {
  paid: "PROCESSING",
  fulfilled: "SHIPPED",
  refunded: "REFUNDED",
  cancelled: "CANCELLED",
};

/**
 * ShopifyService (Volume 7 §31-34) — synchronisation catalogue/commandes.
 * "Shopify reste la source de vérité pour les données Shopify qui lui
 * appartiennent" (§32) : ce service ne fait jamais autorité sur le stock ou
 * le catalogue, il MET EN CACHE localement (table `Product`, Domaine 11)
 * pour un affichage rapide côté app — toute mutation de stock/prix reste
 * pilotée depuis Shopify Admin, jamais depuis Fit4U.
 */
export const shopifyService = {
  /** Synchronise le catalogue complet — appelée par un job planifié ou manuellement depuis le BackOffice. */
  async syncProducts(): Promise<{ syncedCount: number }> {
    let sinceId: number | undefined;
    let syncedCount = 0;

    // Pagination Shopify par `since_id` — pas de boucle infinie possible
    // (§53 : retry contrôlé) : s'arrête dès qu'une page ne renvoie aucun produit.
    for (let page = 0; page < 100; page += 1) {
      const { products } = await shopifyClient.listProducts({ limit: 50, sinceId });
      if (products.length === 0) break;

      for (const product of products) {
        await this.upsertProductFromShopify(product);
        syncedCount += 1;
      }

      sinceId = products.at(-1)?.id;
    }

    logger.info({ syncedCount }, "Synchronisation catalogue Shopify terminée");
    return { syncedCount };
  },

  async upsertProductFromShopify(product: ShopifyProduct): Promise<void> {
    const primaryVariant = product.variants[0];
    if (!primaryVariant) return; // produit sans variante — rien à afficher côté app

    const category = await repository.ensureCategory(product.vendor || "Divers");

    await repository.upsertProduct({
      shopifyProductId: String(product.id),
      categoryId: category.id,
      name: product.title,
      slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: product.body_html?.replace(/<[^>]+>/g, "") ?? undefined,
      priceCents: Math.round(Number(primaryVariant.price) * 100),
      currency: "EUR",
      imageUrl: product.images[0]?.src,
      stockQuantity: primaryVariant.inventory_quantity,
    });
  },

  /**
   * Traite un webhook Shopify déjà vérifié (signature) et déduplique via
   * `WebhookEvent` (Volume 7 §16, §34) — même garde-fou que les webhooks
   * Stripe, provider différent.
   */
  async handleWebhook(topic: string, shopifyEventId: string, payload: unknown): Promise<void> {
    if (await webhookEventService.isDuplicate("shopify", shopifyEventId)) {
      return;
    }

    const record = await webhookEventService.recordIncoming({
      provider: "shopify",
      externalEventId: shopifyEventId,
      eventType: topic,
      payload,
    });

    try {
      switch (topic) {
        case "products/update":
        case "products/create":
          await this.upsertProductFromShopify(payload as ShopifyProduct);
          break;
        case "orders/updated":
        case "orders/paid":
        case "orders/cancelled":
        case "orders/fulfilled": {
          const order = payload as ShopifyOrder;
          const mappedStatus = ORDER_STATUS_MAP[order.financial_status] ?? ORDER_STATUS_MAP[order.fulfillment_status ?? ""];
          if (mappedStatus) {
            await repository.updateOrderStatusByShopifyId(String(order.id), mappedStatus);
          }
          break;
        }
        default:
          logger.debug({ topic }, "Webhook Shopify reçu mais non traité (topic non géré)");
      }
      if (record) await webhookEventService.markProcessed(record.id);
    } catch (err) {
      if (record) await webhookEventService.markFailed(record.id, err instanceof Error ? err.message : "Erreur inconnue");
      throw err;
    }
  },
};
