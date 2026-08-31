import type { ToolDefinition } from "./types";

/**
 * Registre des 12 outils internes (Volume 5, liste exhaustive du Master
 * Prompt). Chaque définition suit le format function-calling OpenAI —
 * consommée par `TeddyCore` pour la déclaration `tools:` de l'appel LLM.
 * L'exécution réelle (accès Prisma via repository) est injectée par le
 * backend (voir `backend/src/ai/tools/toolExecutor.ts`).
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "GenerateWorkout",
    description: "Génère un programme d'entraînement personnalisé selon l'objectif, le niveau et l'équipement disponible.",
    parameters: {
      type: "object",
      properties: {
        goalType: { type: "string", description: "Objectif (ex. WEIGHT_LOSS, MUSCLE_GAIN)" },
        difficultyLevel: { type: "string", description: "Niveau", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
        durationWeeks: { type: "number", description: "Durée en semaines" },
        sessionsPerWeek: { type: "number", description: "Nombre de séances par semaine" },
      },
      required: ["goalType", "difficultyLevel"],
    },
  },
  {
    name: "GenerateMealPlan",
    description: "Génère un plan de repas personnalisé selon les préférences alimentaires et l'objectif calorique.",
    parameters: {
      type: "object",
      properties: {
        dailyCalorieTarget: { type: "number", description: "Objectif calorique quotidien" },
        mealsPerDay: { type: "number", description: "Nombre de repas par jour" },
      },
      required: [],
    },
  },
  {
    name: "CalculateCalories",
    description: "Calcule les besoins caloriques et macronutriments quotidiens de l'utilisateur (formule Mifflin-St Jeor).",
    parameters: {
      type: "object",
      properties: {
        activityLevel: {
          type: "string",
          description: "Niveau d'activité",
          enum: ["sedentary", "light", "moderate", "active", "very_active"],
        },
      },
      required: ["activityLevel"],
    },
  },
  {
    name: "SearchExercises",
    description: "Recherche des exercices par nom, groupe musculaire ou équipement.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Terme de recherche" },
        muscleGroupId: { type: "string", description: "Filtrer par groupe musculaire (optionnel)" },
      },
      required: ["query"],
    },
  },
  {
    name: "GetUserHistory",
    description: "Récupère l'historique récent des séances de l'utilisateur.",
    parameters: { type: "object", properties: { limit: { type: "number", description: "Nombre de séances à récupérer" } }, required: [] },
  },
  {
    name: "GetProgress",
    description: "Récupère les données de progression (poids, mensurations, records) de l'utilisateur.",
    parameters: { type: "object", properties: { periodDays: { type: "number", description: "Période en jours" } }, required: [] },
  },
  {
    name: "SaveWeight",
    description: "Enregistre une nouvelle pesée pour l'utilisateur.",
    parameters: {
      type: "object",
      properties: { weightKg: { type: "number", description: "Poids en kilogrammes" } },
      required: ["weightKg"],
    },
  },
  {
    name: "SaveWorkout",
    description: "Enregistre une séance complétée par l'utilisateur.",
    parameters: {
      type: "object",
      properties: { workoutSessionId: { type: "string", description: "Identifiant de la séance en cours" } },
      required: ["workoutSessionId"],
    },
  },
  {
    name: "CreateChallenge",
    description: "Crée un défi personnalisé pour motiver l'utilisateur.",
    parameters: {
      type: "object",
      properties: {
        focus: { type: "string", description: "Thème du défi", enum: ["WORKOUT", "NUTRITION", "CONSISTENCY"] },
        durationDays: { type: "number", description: "Durée du défi en jours" },
      },
      required: ["focus"],
    },
  },
  {
    name: "SearchRecipes",
    description: "Recherche des recettes selon les préférences alimentaires de l'utilisateur.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Terme de recherche" } },
      required: ["query"],
    },
  },
  {
    name: "GetNutritionGoals",
    description: "Récupère les objectifs nutritionnels actuels de l'utilisateur.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "GetShoppingList",
    description: "Récupère la liste de courses actuelle de l'utilisateur.",
    parameters: { type: "object", properties: {}, required: [] },
  },
];

export function findToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

export function toOpenAIToolsFormat(): { type: "function"; function: ToolDefinition }[] {
  return TOOL_DEFINITIONS.map((tool) => ({ type: "function", function: tool }));
}
