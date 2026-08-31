# Développement local — Fit4U by TH

## Prérequis

- Node.js ≥ 20
- pnpm ≥ 9 (`corepack enable` l'installe automatiquement)
- Docker + Docker Compose (pour PostgreSQL/Redis locaux)

## Démarrage (Volume 8 §46 — sans connaissance orale du projet)

```bash
# 1. Cloner
git clone <url-du-repo> fit4u && cd fit4u

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env : au minimum JWT_SECRET/JWT_REFRESH_SECRET (32+ caractères).
# Les clés Stripe/PayPal/Shopify/OpenAI peuvent rester vides pour démarrer —
# seules les fonctionnalités correspondantes seront indisponibles localement.

# 4. Démarrer PostgreSQL + Redis
docker compose -f docker/docker-compose.yml up -d postgres redis

# 5. Appliquer les migrations
pnpm prisma:migrate

# 5bis. Charger les données de référence (FeatureDefinition/FeatureFlag — requis pour Premium/Entitlements)
pnpm prisma:seed

# 6. Démarrer le backend
pnpm dev:backend

# 7. Dans d'autres terminaux, au besoin :
pnpm dev:web       # http://localhost:5173
pnpm dev:admin     # http://localhost:5174
pnpm dev:mobile    # Expo — scanner le QR code avec l'app Expo Go
```

## Vérifier que tout fonctionne

```bash
curl http://localhost:4000/health        # { "status": "ok" }
curl http://localhost:4000/health/ready  # vérifie PostgreSQL + Redis
open http://localhost:4000/docs          # documentation Swagger interactive
```

## Branches (Volume 8 §9)

| Branche | Usage |
|---|---|
| `main` | Production — protégée, fusion uniquement via PR approuvée |
| `develop` | Staging — intégration continue des fonctionnalités |
| `feature/<nom>` | Nouvelle fonctionnalité, part de `develop` |
| `fix/<nom>` | Correction non urgente, part de `develop` |
| `hotfix/<nom>` | Correction urgente production, part de `main` |
| `release/<version>` | Stabilisation avant publication |

## Commits (Volume 8 §10 — Conventional Commits)

```
feat(teddy): add workout generation workflow
fix(auth): correct refresh token expiry check
security(webhooks): fix raw body parsing bypass
```

## Tout ce qui tourne en local sans clé API réelle

Backend, base de données, authentification email/mot de passe, toutes les
routes CRUD, BackOffice. **Nécessitent une vraie clé** : Teddy (OpenAI),
paiements (Stripe/PayPal), Shopify, OAuth Google/Apple.
