import type { WorkflowDefinition } from "./types";

/**
 * Workflow de référence explicitement décrit au Volume 5 :
 * "Je veux perdre 10 kg." → Analyser profil → Calcul calories → Créer
 * objectif → Créer programme → Créer nutrition → Créer défi → Planifier
 * semaine → Répondre.
 *
 * Séquence FIXE (déterministe) : `workflowEngine.ts` l'exécute pas à pas
 * dans cet ordre exact, quel que soit le phrasé exact de la demande
 * utilisateur (détecté par `core/contextDetection.ts`).
 */
export const LOSE_WEIGHT_WORKFLOW: WorkflowDefinition = {
  id: "lose_weight",
  trigger: "L'utilisateur exprime un objectif de perte de poids chiffré (ex. \"je veux perdre 10 kg\").",
  steps: [
    { name: "analyze_profile", description: "Charger la mémoire complète (permanente + évolutive) de l'utilisateur." },
    { name: "calculate_calories", toolName: "CalculateCalories", description: "Calculer les besoins caloriques ajustés à l'objectif de perte de poids." },
    { name: "create_goal", description: "Créer l'objectif de poids cible dans `goals` (Volume 2)." },
    { name: "generate_workout", toolName: "GenerateWorkout", description: "Générer un programme adapté à l'objectif perte de poids." },
    { name: "generate_meal_plan", toolName: "GenerateMealPlan", description: "Générer un plan nutritionnel aligné sur les calories calculées." },
    { name: "create_challenge", toolName: "CreateChallenge", description: "Créer un défi de constance pour soutenir la motivation initiale." },
    { name: "plan_week", description: "Répartir séances/repas sur la semaine (module `planner`)." },
    { name: "respond", description: "Formuler la réponse finale résumant tout ce qui a été créé, de façon motivante et actionnable." },
  ],
};
