# Architecture — Fit4U by TH

## Principes

- **Clean Architecture** : les règles métier (services) ne dépendent jamais des frameworks
  (Express, Prisma, React Native). Les dépendances pointent vers l'intérieur.
- **SOLID / DRY / KISS** appliqués systématiquement ; composition plutôt qu'héritage.
- **Un domaine = un module autonome**, avec sa propre structure interne standardisée.

## Flux backend

```
Requête HTTP
  → Route (déclaration + injection de dépendances)
  → Middleware (auth, rate limit, validation Zod)
  → Controller (parsing requête / formatage réponse, aucune règle métier)
  → Service (logique métier pure, testable sans Express)
  → Repository (seule couche parlant à Prisma)
  → PostgreSQL
```

Toute erreur métier est levée sous forme d'`AppError` et interceptée par le middleware
central `errorHandler`, qui journalise (`logger`) et renvoie un message compréhensible —
jamais de détail technique au client.

## Flux front (mobile/web/admin)

```
Écran / Composant
  → Hook du module (ex. useAuth) — unique point d'entrée
  → Service du module — logique et stockage (SecureStore, cache…)
  → API du module — seule couche autorisée à appeler httpClient
  → Backend
```

## État global

Un store par domaine (Zustand), jamais un store monolithique unique. Chaque store est
consommé via un hook dédié, sans accès direct depuis les composants aux couches inférieures.

## Coach IA Teddy

Toute la logique IA (prompts, orchestration, sécurité/détection de sujets sensibles) vit
exclusivement dans `packages/teddy-sdk`. Le backend et les apps ne consomment que son API
publique typée — jamais d'appel direct à un provider IA tiers en dehors de ce module.

## Sécurité

- Validation systématique côté serveur (Zod), même si le client valide déjà.
- Rate limiting global + rate limiting renforcé sur les routes sensibles (auth).
- JWT access (courte durée) + refresh token (rotation à chaque utilisation).
- Logs d'audit (`AuditLog`) pour les actions sensibles.
- Aucun message d'erreur technique exposé au client final.
