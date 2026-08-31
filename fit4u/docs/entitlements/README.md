# Entitlements — Fit4U by TH

## Architecture

```
User → EntitlementService → { rôle RBAC | VIP actif | Abonnement actif } → AccessLevel → Feature
```

`EntitlementService` (`backend/src/services/entitlement.service.ts`) est la
SEULE source de vérité des droits applicatifs (Volume 7 §11). Aucun module
ne vérifie `user.isPremium` directement — tout passe par
`requireFeature(featureKey)` (middleware) ou `entitlementService.hasFeature()`.

## Niveaux d'accès et priorité

`FREE < PREMIUM < PRO < VIP < ADMIN` — priorité déclarée dans
`config/accessLevels.ts#ACCESS_LEVEL_PRIORITY` (Volume 7 §12, configurable :
modifier l'ordre du tableau change tout le système sans toucher au reste du code).

## Résolution (par ordre de vérification)

1. **Rôle RBAC** (`ADMIN`/`SUPER_ADMIN`) → `ADMIN`
2. **VIP actif** (`VipAccess.findActiveByEmail`, email correspondant, actif, dans sa fenêtre de validité) → `VIP`
3. **Abonnement actif** (`Subscription`, statut `TRIALING`/`ACTIVE`/`PAST_DUE`) → niveau du `SubscriptionPlan` souscrit (`PREMIUM` ou `PRO`)
4. **Par défaut** → `FREE`

## Fraîcheur des données

Contrairement aux permissions RBAC (Volume 6, mises en cache dans le JWT
jusqu'à 15 minutes), l'EntitlementService interroge la base de données
**à chaque appel**. Un paiement qui vient de réussir débloque l'accès
immédiatement — jamais après un délai d'attente de refresh token.

## Fonctionnalités configurables (`FeatureDefinition`)

Table `feature_definitions` (clé, `minimumLevel`, `isActive`) — modifiable
depuis le BackOffice sans déploiement (Volume 7 §5). "Fail closed" : une
clé de fonctionnalité inconnue ou désactivée est TOUJOURS refusée, jamais
silencieusement autorisée.

## Utilisation dans une route backend

```ts
router.post("/teddy/vision/analyze", requireAuth, requireFeature("teddy.vision"), asyncHandler(controller.analyze));
```

## Ce qui n'est PAS fait

- Pas d'interface BackOffice dédiée pour créer/éditer les `FeatureDefinition`
  (la table existe, l'endpoint CRUD admin reste à ajouter — suit exactement
  le pattern `admin/feature-flags` du Volume 6).
- Le calcul de priorité entre statuts simultanés (ex. VIP + abonnement PRO
  actifs en même temps) retient toujours le PLUS ÉLEVÉ, jamais une fusion
  des deux ensembles de droits — comportement volontaire (§12).
