# Fit4U by TH

Plateforme SaaS Premium — Fitness, Nutrition, Coach IA **Teddy**, Gamification, Communauté.
Monorepo pnpm, pensé pour évoluer vers plusieurs millions d'utilisateurs.

## Structure

```
fit4u/
├── apps/
│   ├── mobile/    → React Native + Expo (iOS/Android)
│   ├── web/       → React + Vite (app utilisateur)
│   └── admin/     → React + Vite (BackOffice / ERP)
├── backend/       → Node.js + Express + TypeScript
├── packages/
│   ├── ui/        → design system partagé (thème noir/orange/blanc)
│   ├── types/     → types TypeScript partagés (DTO, contrats API)
│   ├── config/    → configs ESLint/TS partagées
│   └── teddy-sdk/ → module dédié au Coach IA Teddy
├── prisma/        → schéma de base de données unique
├── docker/        → Docker Compose (Postgres, Redis, backend)
├── docs/          → documentation technique
└── scripts/       → scripts d'installation et de génération de modules
```

## Démarrage rapide

```bash
./scripts/setup.sh        # installe les dépendances, démarre Postgres/Redis, migre la DB
pnpm dev:backend           # API sur http://localhost:4000 (docs Swagger sur /docs)
pnpm dev:web                # app web sur http://localhost:5173
pnpm dev:mobile             # app mobile via Expo
pnpm dev:admin               # BackOffice sur http://localhost:5174
```

## Avancement (Master Prompt Claude Code, 8 volumes)

| Volume | Contenu | Statut |
|---|---|---|
| 1 | Spécifications générales, monorepo, stack officielle | ✔ |
| 2 | Architecture PostgreSQL + Prisma (93 modèles, 12 domaines) | ✔ |
| 3 | Backend Node.js + Express (14 modules, Teddy AI, temps réel, jobs) | ✔ |
| 4 | Frontend React Native + React Web (design system, mobile complet, web/admin de référence) | ✔ |
| 5 | Teddy AI Engine (10 modules, mémoire 3 niveaux, prompts hiérarchiques, outils, sécurité) | ✔ |
| 6 | BackOffice ERP (RBAC 8 rôles, audit trail, 18 sections, tests) | ✔ |
| 7 | E-commerce, Abonnements, Paiements & Shopify (Entitlements, Stripe/PayPal, webhooks idempotents, Shopify) | ✔ |
| 8 | QA, CI/CD, Docker, Déploiement & Exploitation (RGPD, tests E2E, pipeline complète, documentation d'exploitation) | ✔ |

**Les 8 volumes du Master Prompt sont maintenant traités.**

⚠️ **Avant toute prétention de "prêt pour la production"** : lire
`docs/PROJECT_STATUS.md`, qui distingue explicitement ce qui est
implémenté, testé, vérifié et déployé — aucune ligne de ce projet n'a été
exécutée dans un environnement réel au cours de sa construction (pas de
réseau sortant, pas de Docker actif, pas de base de données réellement
démarrée dans l'environnement de développement utilisé).

Voir `docs/DATABASE_ARCHITECTURE.md`, `docs/BACKEND_ARCHITECTURE.md`,
`docs/FRONTEND_ARCHITECTURE.md`, `packages/teddy-sdk/docs/` (Volume 5),
`apps/admin/docs/` (Volume 6), `docs/{payments,subscriptions,vip,shopify,webhooks,entitlements}/`
(Volume 7) et `docs/{deployment,local-development,staging,production,rollback,disaster-recovery}.md`
(Volume 8) pour le détail de chaque volume livré.

## Règles d'ingénierie non négociables

1. **Architecture propre** : Route → Controller → Service → Repository (backend) ;
   composants → hooks → services → api (front).
2. **TypeScript strict**, aucun `any`.
3. **Aucune logique IA** en dehors de `packages/teddy-sdk`.
4. **Aucun texte codé en dur** — tout passe par l'i18n (fr, en, es, de, it, pt).
5. **BackOffice (`apps/admin`) toujours séparé** de l'app utilisateur.
6. Nouveau module métier → `./scripts/bootstrap-module.sh <base> <nom>` pour respecter la
   structure standard (`components/hooks/services/api/types/validators/utils/tests`).

Voir `docs/ARCHITECTURE.md` pour le détail des choix techniques.
