# Webhooks — Fit4U by TH

## Endpoints

| Endpoint | Prestataire | Signature |
|---|---|---|
| `POST /api/v1/payments/webhook` | Stripe | `stripe-signature` (HMAC, `Stripe.webhooks.constructEvent`) |
| `POST /api/v1/webhooks/shopify` | Shopify | `x-shopify-hmac-sha256` (HMAC SHA-256, `shopifyWebhookVerify.ts`) |

Les deux routes sont **hors** de toute authentification utilisateur — la
sécurité repose exclusivement sur la vérification de signature.

## ⚠️ Bug corrigé ce volume — parsing du corps de requête

`express.json()` était monté globalement (`app.ts`) et s'exécutait sur
**toutes** les requêtes avant qu'elles n'atteignent les routes webhook,
qui déclarent pourtant leur propre `express.raw()`. Résultat : le corps
était déjà parsé en JSON au moment de la vérification de signature,
cassant silencieusement la vérification HMAC (Stripe/Shopify signent les
octets BRUTS, pas un objet JS re-sérialisé). Corrigé en excluant
explicitement les deux chemins webhook du parsing JSON/urlencoded global
(voir `app.ts`, section body parsing). **Point de vigilance pour tout
futur webhook ajouté** : penser à l'ajouter à `RAW_BODY_PATHS`.

## Idempotence (Volume 7 §16)

Table unique `WebhookEvent` (`@@unique([provider, externalEventId])`),
partagée par tous les prestataires :

```
1. isDuplicate(provider, externalEventId) → déjà PROCESSED ? → 200 OK, rien de plus
2. recordIncoming() → persisté AVANT tout traitement métier (trace même en cas de crash)
3. Dispatch vers le service du domaine concerné (Stripe : payments vs subscriptions ; Shopify : catalogue vs commandes)
4. markProcessed() ou markFailed(error) selon l'issue
```

Un événement qui échoue reste en base avec `status: FAILED` et son message
d'erreur — rejouable manuellement (le prestataire retente aussi
automatiquement selon sa propre politique).

## Observabilité (§51)

Chaque webhook journalise : `provider`, `externalEventId`, `eventType`,
`status`, `processedAt`/`error`. Aucun secret ni donnée bancaire n'est
jamais journalisé — `payload` stocke l'événement complet du prestataire
(qui ne contient déjà aucune donnée de carte brute, Stripe/Shopify ne les
transmettent jamais dans un webhook).

## Ce qui n'est pas fait

- Dead-letter queue (§53) pour les événements `FAILED` de manière répétée —
  actuellement consultables via `status: FAILED` mais aucune alerte
  automatique ni file de re-traitement dédiée.
- Webhooks Apple/Google (App Store Server Notifications, Real-time
  Developer Notifications) — non implémentés, voir `docs/subscriptions/README.md`.
