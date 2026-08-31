# Subscriptions — Fit4U by TH

## Modèle

```
SubscriptionPlan (catalogue interne, ex. FIT4U_PREMIUM_MONTHLY)
  ↓
SubscriptionPrice (par provider/devise/intervalle)
  ↓
Subscription (par utilisateur — statut, période, cancelAtPeriodEnd)
  ↓
SubscriptionPayment (historique financier, jamais supprimé)
```

## États (Volume 7 §17)

`TRIALING → ACTIVE → PAST_DUE → CANCELED/EXPIRED`. Un abonnement
`INCOMPLETE` (paiement initial non confirmé) n'accorde jamais de droits —
seuls `TRIALING`/`ACTIVE`/`PAST_DUE` sont considérés "actifs" par
`EntitlementRepository.findActiveSubscription()`.

## Annulation (§18)

`POST /subscriptions/cancel` avec `immediately: false` (défaut) :
`cancelAtPeriodEnd = true`, les droits restent actifs jusqu'à
`currentPeriodEnd`. `immediately: true` coupe l'accès tout de suite
(statut `CANCELED` immédiat) — réservé aux cas exceptionnels (ex. fraude
avérée), jamais le comportement par défaut d'un clic utilisateur.

## Renouvellement

Géré par le webhook Stripe (`invoice.paid` → nouvelle ligne
`SubscriptionPayment`), jamais par un job de polling. `invoice.payment_failed`
→ statut `PAST_DUE` (accès conservé le temps que Stripe retente le
prélèvement selon sa propre politique de retry).

## Coupons (§23)

`couponService.validate()` (partagé avec la Boutique) vérifie
expiration/limite d'utilisation. La réduction récurrente elle-même est
appliquée nativement par Stripe (`coupon` sur `subscriptions.create()`) —
suppose qu'un Coupon Stripe du même code existe côté Dashboard Stripe.
PayPal n'a pas d'équivalent pour les abonnements récurrents (documenté
dans `stripeProvider.ts`/`paypalProvider.ts`).

## Ce qui n'est pas fait

- Essai gratuit configurable par produit (§25) — le paramètre `trialDays`
  existe dans `PaymentProvider.createSubscription()` mais n'est pas encore
  exposé par `CreateSubscriptionInput` ni piloté depuis le catalogue.
- Migration d'abonnement (changement de plan en cours de période, §45) —
  non implémentée ; nécessite une logique de proratisation.
- Google Play / App Store (§26) — aucune vérification de reçu mobile
  implémentée ; `provider` accepte aujourd'hui uniquement `stripe`/`paypal`.
