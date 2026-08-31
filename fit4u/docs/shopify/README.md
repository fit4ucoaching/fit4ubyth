# Shopify — Fit4U by TH

## Principe (Volume 7 §31-32)

Shopify reste la **source de vérité** pour tout ce qui lui appartient
(catalogue, stock, commandes). Fit4U **met en cache** localement (table
`Product`, Domaine 11) pour un affichage rapide côté app — aucune mutation
de stock/prix n'est jamais pilotée depuis Fit4U vers Shopify dans ce volume.

## Synchronisation

```
Shopify Admin → shopify.client.ts (REST Admin API, fetch natif, pas de SDK)
  ↓
shopify.service.ts#syncProducts() — pagination par since_id, mapping vers Product
  ↓
shopify.repository.ts — upsert par shopifyProductId (idempotent par construction)
```

Déclenchement manuel : `POST /admin/shop/sync` (permission `shop.write`,
chaîne de middlewares admin complète). Aucun job planifié automatique dans
ce volume — point d'extension documenté (BullMQ, même pattern que
`backupQueue`).

## Webhooks (§34)

`POST /webhooks/shopify` (racine API, hors `/admin` — un webhook n'a pas de
session utilisateur). Sécurité : vérification HMAC SHA-256 en temps
constant (`shopifyWebhookVerify.ts`), jamais une comparaison de chaînes
naïve (vulnérable au timing attack). Idempotence via la même table
`WebhookEvent` que Stripe (`provider: "shopify"`).

Topics traités : `products/create`, `products/update`, `orders/updated`,
`orders/paid`, `orders/cancelled`, `orders/fulfilled`. Tout autre topic est
reçu, journalisé, marqué traité — jamais une erreur pour un topic non géré.

## Statuts de commande

| Shopify | Fit4U (`OrderStatus`) |
|---|---|
| `financial_status: paid` | `PROCESSING` |
| `fulfillment_status: fulfilled` | `SHIPPED` |
| `financial_status: refunded` | `REFUNDED` |
| `financial_status: cancelled` | `CANCELLED` |

## Ce qui n'est pas fait

- Collections/variantes multiples par produit (§32) — seule la première
  variante est utilisée pour le prix/stock affichés côté app.
- Clients Shopify (`Customer`) — aucune synchronisation, les commandes sont
  associées au compte Fit4U par email au moment du checkout (Domaine 11,
  hors périmètre de ce document).
- Mode dégradé explicite (§52) si Shopify est indisponible pendant une
  synchronisation manuelle — l'appel échoue actuellement avec une erreur
  HTTP standard, sans file d'attente de retry automatique.
