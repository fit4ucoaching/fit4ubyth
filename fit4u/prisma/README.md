# Prisma — Fit4U by TH

Schéma canonique unique (`schema.prisma`), Master Prompt Volume 2/8.
**92 modèles** (90 tables métier + 2 tables de jonction techniques),
**27 enums**, 12 domaines fonctionnels. Voir
`docs/DATABASE_ARCHITECTURE.md` pour le détail des décisions de
modélisation et `docs/MIGRATIONS.md` pour la procédure de migration
domaine par domaine (001_auth → 012_admin).

## Commandes

```bash
pnpm prisma:generate   # Génère le client Prisma
pnpm prisma:migrate    # Crée/applique une migration en dev
```

## Règles non négociables (rappel)

- UUID (`gen_random_uuid()`) en clé primaire sur toutes les tables.
- `createdAt`/`updatedAt` en `TIMESTAMPTZ` (UTC) sur toutes les tables.
- `deletedAt` (soft delete) sur les tables métier — jamais de suppression
  physique des entités principales.
- Tables `snake_case`, modèles `PascalCase`, colonnes `camelCase` (`@map`).
- Aucune logique métier dans le schéma : uniquement la structure des
  données. Toute la logique IA de Teddy vit dans `packages/teddy-sdk`,
  jamais dans une contrainte ou un trigger SQL.

## ⚠️ Impact sur le backend (Volume 1)

Ce schéma remplace le `User` simplifié du bootstrap Volume 1. Voir
`docs/DATABASE_ARCHITECTURE.md` §3 pour le détail exact des champs
déplacés (`firstName`/`lastName`/`isPremium` → `Profile`, `role` enum →
RBAC `Role`/`UserRole`) et les fichiers backend à adapter en conséquence.
