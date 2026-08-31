# Tools — Teddy AI Engine

## Séparation schéma / exécution

Le SDK (`tools/toolRegistry.ts`) déclare le **schéma** des 12 outils
(format function-calling OpenAI) — jamais leur implémentation. L'exécution
réelle vit dans `backend/src/ai/tools/toolExecutor.ts`, seul fichier
autorisé à relier un outil à un repository Prisma.

> "Teddy ne connaît jamais directement Prisma. Toujours passer par
> Services/Repositories/Tools." — Volume 5

## Les 12 outils

| Outil | Exécution backend | Repository utilisé |
|---|---|---|
| `GenerateWorkout` | `ai.service.generateWorkoutProgram` | `AIRepository` |
| `GenerateMealPlan` | `ai.service.generateNutritionPlan` | `AIRepository` |
| `CalculateCalories` | `teddy-sdk#calculateMacroTargets` (pur) | `AIRepository.getProfileForCalorieCalculation` |
| `SearchExercises` | `ExercisesRepository.search` | `modules/exercises` |
| `GetUserHistory` | `WorkoutsRepository.findHistory` | `modules/workouts` |
| `GetProgress` | `ProgressRepository.getAnalytics` | `modules/progress` |
| `SaveWeight` | `ProgressRepository.logWeight` | `modules/progress` |
| `SaveWorkout` | Confirmation (persistance réelle via `/workouts/finish`) | — |
| `CreateChallenge` | `AIRepository.createChallenge` | `AIRepository` |
| `SearchRecipes` | `NutritionRepository.findRecipes` | `modules/nutrition` |
| `GetNutritionGoals` | `AIRepository.getNutritionGoal` | `AIRepository` |
| `GetShoppingList` | `AIRepository.getShoppingList` | `AIRepository` |

## Cycle de vie d'un appel d'outil

```
1. core/teddyCore.ts#initiateTeddyTurn() → LLM répond avec tool_calls
2. backend/ai.service.ts → boucle sur turn.toolCalls
3. tools/toolExecutor.ts#executeTool() → exécution réelle (Prisma via repository)
4. core/teddyCore.ts#completeTeddyTurn() → réponse finale avec résultats intégrés
```

Maximum 3 itérations par tour de conversation (`ai.service.ts`, garde-fou
anti-boucle infinie) — au-delà, une réponse de repli est renvoyée.

## Ajouter un nouvel outil

1. Ajouter sa définition (nom, description, paramètres JSON Schema) dans
   `tools/toolRegistry.ts#TOOL_DEFINITIONS`.
2. Ajouter le `case` correspondant dans `backend/src/ai/tools/toolExecutor.ts`.
3. Documenter ici.

Ne jamais exécuter un outil directement depuis un module domaine du SDK —
toujours via ce cycle en 2 phases.
