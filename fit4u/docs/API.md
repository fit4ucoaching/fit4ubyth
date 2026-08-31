# API — Fit4U by TH

Base URL (dev) : `http://localhost:4000/api/v1`

Toutes les réponses suivent l'enveloppe uniforme (Volume 3) :

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "...", "message": "...", "details": {}, "requestId": "..." } }
```

## Documentation exhaustive : Swagger/OpenAPI

Depuis le Volume 3, la référence exhaustive et à jour de tous les endpoints
(14 modules + Teddy AI) est **générée automatiquement** depuis le code —
ce fichier ne duplique plus la liste des routes pour éviter toute
divergence entre documentation et implémentation.

```bash
pnpm dev:backend
# Interface interactive : http://localhost:4000/docs
# Spec OpenAPI brute (JSON) : http://localhost:4000/docs.json
```

Chaque route est documentée directement dans son `*.routes.ts` via un bloc
`@openapi` (Volume 3 : "Chaque endpoint contient Description, Auth,
Paramètres, Réponse, Erreurs, Exemple").

Voir `docs/BACKEND_ARCHITECTURE.md` pour la vue d'ensemble des modules et
des décisions d'architecture.
