import { env } from "../config/env";
import { logger } from "../config/logger";

const SHOPIFY_API_VERSION = "2024-07";

/**
 * Client HTTP minimal vers l'API Admin Shopify (REST) — Volume 7 §31.
 * Aucun SDK tiers : la surface utilisée (produits/commandes/webhooks) est
 * réduite, un client `fetch` fin reste plus simple à auditer.
 */
async function shopifyRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": env.SHOPIFY_TOKEN,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ status: res.status, path, body }, "Erreur API Shopify");
    throw new Error(`Shopify API a répondu ${res.status} sur ${path}`);
  }

  return res.json() as Promise<T>;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
}

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  sku: string | null;
  inventory_quantity: number;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  email: string | null;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  line_items: { title: string; quantity: number; price: string }[];
  created_at: string;
}

export const shopifyClient = {
  listProducts: (params?: { limit?: number; sinceId?: number }) =>
    shopifyRequest<{ products: ShopifyProduct[] }>(
      `/products.json?limit=${params?.limit ?? 50}${params?.sinceId ? `&since_id=${params.sinceId}` : ""}`,
    ),

  getOrder: (shopifyOrderId: string) => shopifyRequest<{ order: ShopifyOrder }>(`/orders/${shopifyOrderId}.json`),

  listOrders: (params?: { limit?: number; status?: string }) =>
    shopifyRequest<{ orders: ShopifyOrder[] }>(`/orders.json?limit=${params?.limit ?? 50}&status=${params?.status ?? "any"}`),

  registerWebhook: (topic: string, address: string) =>
    shopifyRequest<{ webhook: { id: number } }>("/webhooks.json", {
      method: "POST",
      body: JSON.stringify({ webhook: { topic, address, format: "json" } }),
    }),
};
