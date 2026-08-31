# Payments — Fit4U by TH

## Règle absolue (Volume 7 §2)

Fit4U ne stocke **jamais** de numéro de carte, CVV, ou donnée bancaire
sensible complète. Seuls les identifiants externes (`providerPaymentId`,
`stripeCustomerId`) et métadonnées (montant en centimes, devise, statut)
sont persistés — la carte elle-même ne transite jamais par le backend
Fit4U (Stripe Elements/PayPal SDK côté client, tokenisation prestataire).

## Domaines distincts (Volume 7 §40)

| | Boutique (Domaine 11) | Abonnements (Domaine 13) |
|---|---|---|
| Modèle | `Order` → `Payment` | `Subscription` → `SubscriptionPayment` |
| Nature | Achat ponctuel | Facturation récurrente |
| Module | `modules/payments/` | `modules/subscriptions/` |

**Ne jamais confondre les deux** — un abonnement Premium n'est jamais une `Order`.

## Abstraction PaymentProvider (§27)

```
payments.service.ts / subscriptions.service.ts
        ↓
payments/registry.ts#getPaymentProvider(name)
        ↓
StripeProvider | PayPalProvider
```

Apple Pay et Google Pay sont des **méthodes de paiement Stripe**
(`automatic_payment_methods`), jamais une logique métier séparée (§29-30).

## Montants

Toujours en unités mineures (centimes) — `amountCents: 1999` = 19,99 €.
Jamais de `float` pour un montant financier critique (§21).

## Remboursements (§19)

`PaymentsController.refund()` → `PaymentProvider.refundPayment()` →
statut `Payment.status = REFUNDED`. L'historique n'est **jamais supprimé**
— une ligne `Payment` remboursée reste visible indéfiniment (§41).

## Ce qui n'est pas fait

- Facturation TVA/taxes par pays (§22) — nécessite une validation
  juridique/comptable préalable, non simulée.
- Détection de fraude heuristique (§44) — points d'instrumentation
  identifiés (`requestId`/`userId` déjà tracés, voir `docs/webhooks/`)
  mais aucun scoring implémenté.
