import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../shopify.client");
vi.mock("../shopify.repository");
vi.mock("../../services/webhookEvent.service", () => ({
  webhookEventService: {
    isDuplicate: vi.fn().mockResolvedValue(false),
    recordIncoming: vi.fn().mockResolvedValue({ id: "rec1" }),
    markProcessed: vi.fn(),
    markFailed: vi.fn(),
  },
}));

import { shopifyClient } from "../shopify.client";
import { ShopifyRepository } from "../shopify.repository";
import { shopifyService } from "../shopify.service";
import { webhookEventService } from "../../services/webhookEvent.service";

/**
 * Tests Shopify (Volume 7 §49) — produit, commande, synchronisation,
 * webhook, commande annulée, fulfillment. Le client HTTP Shopify
 * (`shopify.client.ts`) est mocké : ces tests couvrent la LOGIQUE de
 * synchronisation/mapping, jamais un vrai appel réseau à Shopify.
 */
describe("shopifyService.syncProducts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("synchronise chaque produit reçu et s'arrête à la première page vide", async () => {
    vi.mocked(shopifyClient.listProducts)
      .mockResolvedValueOnce({
        products: [
          { id: 1, title: "T-shirt Fit4U", body_html: "<p>Coton</p>", vendor: "Fit4U", images: [{ src: "http://img/1.jpg" }],
            variants: [{ id: 10, title: "M", price: "29.99", sku: "TS-M", inventory_quantity: 5 }] },
        ],
      })
      .mockResolvedValueOnce({ products: [] });
    vi.mocked(ShopifyRepository.prototype.ensureCategory).mockResolvedValue({ id: "cat1" } as never);
    const upsertSpy = vi.mocked(ShopifyRepository.prototype.upsertProduct).mockResolvedValue({} as never);

    const result = await shopifyService.syncProducts();

    expect(result.syncedCount).toBe(1);
    expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({ shopifyProductId: "1", priceCents: 2999, stockQuantity: 5 }));
  });

  it("ignore un produit sans variante (rien à afficher côté app)", async () => {
    vi.mocked(shopifyClient.listProducts)
      .mockResolvedValueOnce({ products: [{ id: 2, title: "Sans variante", body_html: null, vendor: "Fit4U", images: [], variants: [] }] })
      .mockResolvedValueOnce({ products: [] });
    const upsertSpy = vi.mocked(ShopifyRepository.prototype.upsertProduct);

    const result = await shopifyService.syncProducts();

    expect(result.syncedCount).toBe(0);
    expect(upsertSpy).not.toHaveBeenCalled();
  });
});

describe("shopifyService.handleWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // `vi.clearAllMocks()` ne réinitialise pas les implémentations posées via
    // `mockResolvedValue` (seulement l'historique des appels) — sans ce reset
    // explicite, un `.mockResolvedValue(true)` posé dans un test précédent
    // (ex. "idempotence" ci-dessous) reste actif pour tous les tests suivants.
    vi.mocked(webhookEventService.isDuplicate).mockResolvedValue(false);
    vi.mocked(webhookEventService.recordIncoming).mockResolvedValue({ id: "rec1" } as never);
  });

  it("ignore un événement déjà traité (idempotence)", async () => {
    vi.mocked(webhookEventService.isDuplicate).mockResolvedValue(true);
    const updateSpy = vi.mocked(ShopifyRepository.prototype.updateOrderStatusByShopifyId);

    await shopifyService.handleWebhook("orders/cancelled", "evt_dup", {});

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("commande annulée (orders/cancelled) → statut CANCELLED", async () => {
    const updateSpy = vi.mocked(ShopifyRepository.prototype.updateOrderStatusByShopifyId).mockResolvedValue({} as never);

    await shopifyService.handleWebhook("orders/cancelled", "evt_1", {
      id: 555, financial_status: "cancelled", fulfillment_status: null,
    });

    expect(updateSpy).toHaveBeenCalledWith("555", "CANCELLED");
  });

  it("fulfillment (orders/fulfilled) → statut SHIPPED", async () => {
    const updateSpy = vi.mocked(ShopifyRepository.prototype.updateOrderStatusByShopifyId).mockResolvedValue({} as never);

    await shopifyService.handleWebhook("orders/fulfilled", "evt_2", {
      id: 556, financial_status: "paid", fulfillment_status: "fulfilled",
    });

    expect(updateSpy).toHaveBeenCalledWith("556", "SHIPPED");
  });

  it("commande payée (orders/paid) → statut PROCESSING", async () => {
    const updateSpy = vi.mocked(ShopifyRepository.prototype.updateOrderStatusByShopifyId).mockResolvedValue({} as never);

    await shopifyService.handleWebhook("orders/paid", "evt_3", {
      id: 557, financial_status: "paid", fulfillment_status: null,
    });

    expect(updateSpy).toHaveBeenCalledWith("557", "PROCESSING");
  });

  it("topic inconnu : traité sans erreur, marqué PROCESSED, aucune mutation de commande", async () => {
    const updateSpy = vi.mocked(ShopifyRepository.prototype.updateOrderStatusByShopifyId);
    const markProcessedSpy = vi.mocked(webhookEventService.markProcessed);

    await shopifyService.handleWebhook("customers/create", "evt_4", { id: 999 });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(markProcessedSpy).toHaveBeenCalledWith("rec1");
  });

  it("une erreur pendant le traitement marque l'événement FAILED et la relance", async () => {
    vi.mocked(ShopifyRepository.prototype.updateOrderStatusByShopifyId).mockRejectedValue(new Error("DB indisponible"));
    const markFailedSpy = vi.mocked(webhookEventService.markFailed);

    await expect(
      shopifyService.handleWebhook("orders/paid", "evt_5", { id: 558, financial_status: "paid", fulfillment_status: null }),
    ).rejects.toThrow("DB indisponible");
    expect(markFailedSpy).toHaveBeenCalledWith("rec1", "DB indisponible");
  });
});
