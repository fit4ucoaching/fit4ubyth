import { useState } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";

import { Badge, Card } from "../components/ui";
import { useOrdersList, useProductsList, useSyncShopify, useToggleProductActive } from "../services/useAdminShop";
import { useUiStore } from "../store/uiStore";

function formatCurrency(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

const ORDER_STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  DELIVERED: "success", SHIPPED: "success", PROCESSING: "neutral",
  PENDING: "neutral", CANCELLED: "danger", REFUNDED: "danger",
};

/**
 * Boutique (Volume 6, gap partiellement comblé) — catalogue en LECTURE
 * (source Shopify, Volume 7 : jamais de création/édition manuelle qui
 * entrerait en conflit avec la synchronisation) + bascule de visibilité
 * locale + liste des commandes. La gestion de collections/variantes/coupons
 * avancés reste hors périmètre (voir apps/admin/docs/Modules.md).
 */
export function ShopPage(): JSX.Element {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const { data: products } = useProductsList({ page: 1, pageSize: 50 });
  const { data: orders } = useOrdersList({ page: 1, pageSize: 50 });
  const toggleActive = useToggleProductActive();
  const syncShopify = useSyncShopify();
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-textPrimary">Boutique</h1>
        </div>
        <button
          onClick={() =>
            syncShopify.mutate(undefined, {
              onSuccess: (result) => pushToast({ variant: "success", message: `${result.syncedCount} produit(s) synchronisé(s) depuis Shopify.` }),
              onError: () => pushToast({ variant: "error", message: "Synchronisation Shopify impossible." }),
            })
          }
          disabled={syncShopify.isPending}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-textPrimary hover:bg-surface disabled:opacity-50"
        >
          <RefreshCw size={14} className={syncShopify.isPending ? "animate-spin" : ""} /> Synchroniser Shopify
        </button>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab("products")} className={`px-4 py-2 text-sm font-medium ${tab === "products" ? "border-b-2 border-primary text-primary" : "text-textSecondary"}`}>
          Produits ({products?.total ?? 0})
        </button>
        <button onClick={() => setTab("orders")} className={`px-4 py-2 text-sm font-medium ${tab === "orders" ? "border-b-2 border-primary text-primary" : "text-textSecondary"}`}>
          Commandes ({orders?.total ?? 0})
        </button>
      </div>

      {tab === "products" ? (
        <Card>
          <p className="mb-3 text-xs text-textTertiary">
            Catalogue synchronisé depuis Shopify (source de vérité) — seule la visibilité dans
            l'app Fit4U est pilotable ici, jamais le prix/stock/description.
          </p>
          <div className="divide-y divide-border">
            {(products?.items ?? []).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-textPrimary">{product.name}</p>
                  <p className="text-xs text-textSecondary">{product.category.name} · {formatCurrency(product.priceCents, product.currency)} · stock {product.stockQuantity}</p>
                </div>
                <button
                  onClick={() => toggleActive.mutate({ id: product.id, isActive: !product.isActive })}
                  className={`h-6 w-11 rounded-full transition-colors ${product.isActive ? "bg-primary" : "bg-surface"}`}
                  aria-label={`${product.isActive ? "Masquer" : "Afficher"} ${product.name}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${product.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
            {(products?.items ?? []).length === 0 ? (
              <p className="py-4 text-sm text-textTertiary">Aucun produit — lancez une synchronisation Shopify.</p>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {(orders?.items ?? []).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-textPrimary">
                    {order.user.profile ? `${order.user.profile.firstName} ${order.user.profile.lastName}` : order.user.email}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(", ")} · {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-textPrimary">{formatCurrency(order.totalCents, order.currency)}</span>
                  <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? "neutral"}>{order.status}</Badge>
                </div>
              </div>
            ))}
            {(orders?.items ?? []).length === 0 ? <p className="py-4 text-sm text-textTertiary">Aucune commande.</p> : null}
          </div>
        </Card>
      )}
    </div>
  );
}
