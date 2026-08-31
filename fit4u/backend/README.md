# Backend — Fit4U by TH

API Node.js / Express / TypeScript strict — Master Prompt Volume 3/8.

```
Route → Middleware (auth/validation/rate-limit) → Controller → Service → Repository → Prisma
```

Voir `docs/BACKEND_ARCHITECTURE.md` (racine du monorepo) pour le document complet niveau CTO.

## Structure

```
src/
├── config/        → env (Zod, fail-fast), logger (Pino), swagger
├── database/       → clients Prisma et Redis singletons
├── errors/         → hiérarchie AppError (7 sous-classes)
├── middleware/     → auth, rate limit, erreur, validation, logger, sécurité, CORS, requestId
├── routes/         → agrégateur /api/v1 + health/metrics
├── controllers/    → contrôleurs transverses (health, metrics)
├── services/       → services transverses (VipAccess)
├── repositories/   → BaseRepository, VipAccessRepository
├── validators/     → schémas Zod communs (pagination, id)
├── utils/          → asyncHandler, apiResponse, jwt, password, metrics Prometheus
├── jobs/           → 9 queues/workers BullMQ
├── websocket/       → serveur Socket.IO + 6 canaux
├── ai/              → orchestration Teddy AI (délègue à @fit4u/teddy-sdk)
├── modules/         → 14 modules métier (auth, users, profiles, exercises,
│                       programs, workouts, nutrition, progress, gamification,
│                       community, shop, payments, admin, analytics)
├── app.ts           → composition Express (middlewares, routes, Swagger, erreurs)
└── server.ts         → bootstrap (DB, Redis, Socket.IO, jobs, arrêt gracieux)
```

## Règles

- Aucune requête Prisma en dehors d'un `*.repository.ts`.
- Aucune règle métier dans un `*.controller.ts` (uniquement parsing requête + appel service + réponse).
- Toute entrée est validée via un `*.validators.ts` (Zod) avant d'atteindre le service.
- Toute erreur hérite de `AppError` → interceptée par `error.middleware.ts`, format JSON uniforme.
- Aucune logique IA hors de `@fit4u/teddy-sdk` — `src/ai` orchestre et persiste uniquement.
- Chaque nouveau module suit exactement la structure des modules existants
  (`*.validators.ts *.repository.ts *.service.ts *.controller.ts *.routes.ts tests/`).

## Démarrage

```bash
pnpm dev:backend        # API sur http://localhost:4000
# Documentation interactive : http://localhost:4000/docs
# Spec OpenAPI brute      : http://localhost:4000/docs.json
```

## Tests

```bash
pnpm --filter @fit4u/backend test         # unitaires (Vitest) + API (Supertest)
pnpm --filter @fit4u/backend test:watch
```
