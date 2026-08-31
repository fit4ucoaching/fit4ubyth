# @fit4u/teddy-sdk

Module dédié au Coach IA **Teddy**. Toute la logique IA du produit (prompts, orchestration
conversationnelle, garde-fous de sécurité, génération structurée de plans) est centralisée ici
et exposée via une API stable, consommée par `backend/src/ai` (orchestration + persistance
Prisma) et potentiellement par d'autres runtimes du monorepo à l'avenir.

## Principes

1. Aucune logique IA ailleurs dans le monorepo — `backend/src/ai` ne fait qu'orchestrer
   (récupération de contexte via repositories, appel au SDK, persistance du résultat) et
   exposer les routes HTTP ; il ne construit jamais de prompt ni n'interprète une réponse IA
   lui-même.
2. Le SDK ne lit **aucune variable d'environnement** — un client `OpenAI` déjà configuré est
   injecté par l'appelant à chaque fonction, pour rester agnostique du runtime.
3. Le SDK expose des types stricts (`TeddyMessage`, `TeddyReply`, …) — jamais de `any`.
4. `teddySafetyService` est vérifié en premier sur tout message entrant — la détection de
   détresse prime toujours sur la génération d'une réponse "coaching".
