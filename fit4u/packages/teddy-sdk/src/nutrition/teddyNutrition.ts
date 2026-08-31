import { buildNutritionGenerationPrompt } from "../prompts/systemPrompts";
import { calculateMacroTargets } from "./calculations";
import type { CalorieCalculationInput, MacroTargets } from "./calculations";

/** Domain Prompt du module Nutrition — intègre les macros calculées déterministiquement. */
export function buildNutritionDomainPrompt(
  input: CalorieCalculationInput,
  params: { dietaryPreferences: string[]; mealsPerDay: number },
): { prompt: string; targets: MacroTargets } {
  const targets = calculateMacroTargets(input);

  const prompt = buildNutritionGenerationPrompt("", {
    dailyCalorieTarget: targets.dailyCalories,
    dietaryPreferences: params.dietaryPreferences,
    mealsPerDay: params.mealsPerDay,
  });

  return {
    prompt: `${prompt}\n\nMacros cibles calculées (à respecter strictement) : ${targets.proteinGrams}g protéines, ${targets.carbsGrams}g glucides, ${targets.fatGrams}g lipides. Hydratation recommandée : ${targets.waterMl}ml/jour.`,
    targets,
  };
}

export * from "./calculations";
