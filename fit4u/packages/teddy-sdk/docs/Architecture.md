# Architecture — Teddy AI Engine

**Master Prompt Volume 5/8** — Moteur IA de Fit4U by TH.

## Principe fondateur

Teddy n'est pas un chatbot générique : c'est un système de 10 modules
spécialisés orchestrés par un Core minimal. Chaque module est indépendant,
testable isolément, et ne connaît jamais Prisma directement — la
persistance passe toujours par le backend (`backend/src/ai/`), jamais par
le SDK (`packages/teddy-sdk/`).

```
Utilisateur
  → backend/src/ai/ai.service.ts (orchestration backend, persistance)
    → @fit4u/teddy-sdk core/teddyCore.ts (orchestration IA pure)
      → safety/        (vérification prioritaire)
      → core/contextDetection.ts (routage)
      → <module domaine> (coach/nutrition/recovery/motivation/analytics/planner)
      → prompts/promptChain.ts (assemblage hiérarchique)
      → tools/toolRegistry.ts (déclaration des outils au LLM)
    ← tool_calls éventuels
  → backend/src/ai/tools/toolExecutor.ts (exécution réelle via repositories)
    → @fit4u/teddy-sdk core/teddyCore.ts#completeTeddyTurn (réponse finale)
```

## Les 10 modules

| Module | Rôle | Nature |
|---|---|---|
| **Core** | Orchestration, routage, appel LLM, boucle d'outils | Code (pas de LLM pour le routage) |
| **Memory** | Mémoire permanente/évolutive/conversationnelle, DNA, résumé long terme | Code + LLM (résumé, extraction DNA) |
| **Coach** | Génération/adaptation de séances | Code (adaptation) + LLM (formulation) |
| **Nutrition** | Calculs caloriques, génération de menus | Code (calculs) + LLM (menus) |
| **Recovery** | Décision repos/séance légère/normale | Code déterministe pur |
| **Motivation** | Calcul du ton à adopter | Code déterministe pur |
| **Analytics** | Rapports Daily/Weekly/Monthly, détection de tendance | Code (détection) + LLM (formulation) |
| **Planner** | Répartition hebdomadaire séances/repas | Code déterministe pur |
| **Voice** | Parsing de commandes vocales | Code déterministe (regex) |
| **Vision** | Analyse qualitative de posture (Premium) | LLM multimodal + disclaimer codé en dur |

## Pourquoi autant de logique déterministe (non-LLM) ?

Volume 5 : *"Tous les workflows doivent être déterministes."* Cette
exigence s'étend en pratique à toute décision **auditable et reproductible** :
un calcul calorique, une décision de repos, un ton à adopter, un planning
hebdomadaire. Le LLM intervient uniquement là où le langage naturel est
réellement nécessaire (formuler une séance, un message, une analyse). Ce
choix élimine une classe entière de bugs (le LLM qui recalcule différemment
les mêmes calories d'un appel à l'autre) et rend le système testable par
des tests unitaires classiques plutôt que des évaluations de prompt coûteuses.

## Séparation SDK / Backend

- **`packages/teddy-sdk`** — logique IA pure : prompts, détection, calculs,
  schémas d'outils. Ne lit jamais l'environnement, ne touche jamais Prisma.
  Un client `OpenAI` déjà configuré est injecté par l'appelant à chaque
  fonction (voir `docs/API.md`).
- **`backend/src/ai`** — orchestration applicative : récupère la mémoire
  (via `AIRepository`), appelle le SDK, exécute les outils demandés (via
  `tools/toolExecutor.ts`, seul endroit reliant les outils du SDK aux
  repositories des autres modules backend), persiste la conversation.

## Ce qui n'est pas dans ce volume (transparence)

- **Teddy Vision quantitatif** : mesure d'angles/vitesse nécessite un
  pipeline d'estimation de pose dédié (MediaPipe/OpenPose) sur séquence
  vidéo — hors périmètre d'un LLM multimodal sur image fixe. Le module
  livré fournit un retour qualitatif, jamais une mesure biomécanique.
- **Avatars visuels de Teddy** (2D/3D/animations) : non générés — voir
  `/assets/teddy/README.md`. Le moteur IA est totalement indépendant de
  l'apparence graphique de Teddy.
- **Teddy Family** : nécessite de nouvelles tables Prisma (comptes liés,
  défis familiaux) non ajoutées au schéma Volume 2 — proposition détaillée
  dans `Evolution.md`.
- **Teddy CEO** : assistant admin — nécessite un module backend dédié
  (`backend/src/ai/ceo/`) réutilisant `Analytics` sur les données
  BackOffice ; non construit ce volume, proposition dans `Evolution.md`.
