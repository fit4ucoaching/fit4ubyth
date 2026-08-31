# Workflows — Teddy AI Engine

## Principe : déterminisme strict

*"Tous les workflows doivent être déterministes."* — Volume 5. L'ordre des
étapes d'un workflow est **fixé dans le code** (`workflows/*.ts`), jamais
décidé par le LLM. Le LLM intervient uniquement DANS chaque étape (formuler
une séance, un menu) et à l'étape finale (formuler la réponse) — jamais pour
choisir "quelle étape vient après".

## Workflow de référence : `lose_weight`

Explicitement décrit au Volume 5 : *"Je veux perdre 10 kg."*

```
1. analyze_profile        — charger la mémoire complète (permanente + évolutive)
2. calculate_calories     — outil CalculateCalories
3. create_goal            — créer l'objectif dans `goals` (Volume 2)
4. generate_workout       — outil GenerateWorkout
5. generate_meal_plan     — outil GenerateMealPlan
6. create_challenge       — outil CreateChallenge
7. plan_week              — module Planner (déterministe, sans LLM)
8. respond                — réponse finale motivante
```

Voir `workflows/loseWeightWorkflow.ts`.

## Déclenchement d'un workflow

Un workflow se déclenche quand `core/contextDetection.ts` détecte un
`trigger` correspondant (ex. objectif de perte de poids chiffré). Le
déclenchement effectif d'un workflow multi-étapes (plutôt qu'une simple
réponse conversationnelle avec 1-2 outils) reste un point d'intégration
côté `backend/src/ai/ai.service.ts` — le registre (`workflows/registry.ts`)
et la définition sont prêts, l'exécuteur pas-à-pas (`workflowEngine.ts`,
qui appellerait séquentiellement chaque étape via `toolExecutor.ts`) est le
prochain composant à construire quand le produit aura besoin de plusieurs
workflows distincts (aujourd'hui, un seul workflow de référence existe).

## Ajouter un nouveau workflow

1. Créer `workflows/<nom>Workflow.ts` suivant exactement le pattern de
   `loseWeightWorkflow.ts` (`WorkflowDefinition` avec `id`, `trigger`, `steps`).
2. L'ajouter à `workflows/registry.ts#WORKFLOW_REGISTRY`.
3. Documenter ici.

Un workflow = une séquence fixe d'étapes, jamais un lot de règles
conditionnelles enchevêtrées — si la logique devient trop branchue, c'est
le signe qu'il faut plusieurs workflows plus simples plutôt qu'un seul complexe.
