# VIP — Fit4U by TH

## Flux (Volume 7 §7)

```
Admin ajoute un email → VipAccess créé
  ↓
Utilisateur se connecte avec cet email
  ↓
vipAccessService.resolveForEmail() → accès VIP + liaison automatique du userId
  ↓
Entitlements VIP → accès Premium sans paiement, tous les paywalls désactivés
```

## Lifetime vs temporaire (§8-9)

- **Lifetime** (`isLifetime: true`) : `endDate` absente, aucun renouvellement,
  actif jusqu'à révocation administrative explicite.
- **Temporaire** : `startDate`/`endDate` définies. L'expiration n'est
  **jamais** un job de fond — `VipAccessRepository.findActiveByEmail()`
  filtre `endDate > now()` à chaque requête : un accès expiré cesse d'être
  actif à la milliseconde près, sans latence de traitement par lot.

## Révocation (§10)

`DELETE /admin/vip/:id` → `isActive = false`, jamais une suppression de
ligne — l'historique complet reste consultable (`GET /admin/vip`). Chaque
révocation est journalisée (`AdminLog`, via `adminRepository.logAction()`) :
administrateur, date, cible.

## Priorité VIP (§12)

VIP prime sur PRO et PREMIUM (mais pas sur ADMIN) — voir
`docs/entitlements/README.md`. Un utilisateur VIP avec un abonnement
Premium actif en parallèle reste résolu comme `VIP` (statut le plus élevé),
jamais une fusion des deux droits.

## Import CSV (Volume 6, réutilisé ici)

`POST /admin/vip/import` — une adresse par ligne (`email,note`), lignes
invalides ignorées et comptabilisées plutôt que de faire échouer tout l'import.
