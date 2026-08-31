import { buildCoachDomainPrompt, type CoachContext } from "../coach/teddyCoach";
import { buildMotivationDomainPrompt, type MotivationInput } from "../motivation/teddyMotivation";
import { buildNutritionDomainPrompt } from "../nutrition/teddyNutrition";
import type { CalorieCalculationInput } from "../nutrition/calculations";
import { buildPlannerDomainPrompt, type PlannedEvent } from "../planner/teddyPlanner";
import { buildRecoveryDomainPrompt, type RecoveryInput } from "../recovery/teddyRecovery";
import { buildAnalyticsDomainPrompt, type AnalyticsSnapshot } from "../analytics/teddyAnalytics";
import type { DetectedDomain } from "./contextDetection";
import { GENERAL_DOMAIN_PROMPT } from "./generalDomainPrompt";

/**
 * Contextes optionnels que le backend peut fournir selon les données
 * disponibles pour l'utilisateur — `TeddyCore` route vers le bon
 * constructeur de Domain Prompt selon `DetectedDomain`, et retombe sur
 * `GENERAL_DOMAIN_PROMPT` si le contexte nécessaire n'est pas fourni
 * (ex. domaine "recovery" détecté mais aucune donnée de récupération
 * disponible pour cet utilisateur).
 */
export interface DomainPromptContexts {
  coach?: CoachContext;
  nutrition?: { calorie: CalorieCalculationInput; dietaryPreferences: string[]; mealsPerDay: number };
  recovery?: RecoveryInput;
  motivation?: MotivationInput;
  analytics?: { snapshot: AnalyticsSnapshot; userContext: string };
  planner?: PlannedEvent[];
}

/** Point d'entrée UNIQUE pour obtenir le Domain Prompt — jamais construit ailleurs dans `TeddyCore`. */
export function buildDomainPrompt(domain: DetectedDomain, contexts: DomainPromptContexts): string {
  switch (domain) {
    case "coach":
      return contexts.coach ? buildCoachDomainPrompt(contexts.coach) : GENERAL_DOMAIN_PROMPT;
    case "nutrition":
      return contexts.nutrition
        ? buildNutritionDomainPrompt(contexts.nutrition.calorie, contexts.nutrition).prompt
        : GENERAL_DOMAIN_PROMPT;
    case "recovery":
      return contexts.recovery ? buildRecoveryDomainPrompt(contexts.recovery) : GENERAL_DOMAIN_PROMPT;
    case "motivation":
      return contexts.motivation ? buildMotivationDomainPrompt(contexts.motivation) : GENERAL_DOMAIN_PROMPT;
    case "analytics":
      return contexts.analytics
        ? buildAnalyticsDomainPrompt(contexts.analytics.snapshot, contexts.analytics.userContext)
        : GENERAL_DOMAIN_PROMPT;
    case "planner":
      return contexts.planner ? buildPlannerDomainPrompt(contexts.planner) : GENERAL_DOMAIN_PROMPT;
    default:
      return GENERAL_DOMAIN_PROMPT;
  }
}
