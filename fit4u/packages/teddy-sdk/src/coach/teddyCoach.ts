import { buildWorkoutGenerationPrompt } from "../prompts/systemPrompts";
import { computeAdaptation } from "./adaptation";
import type { CoachContext } from "./types";

/**
 * Domain Prompt du module Coach — fourni à `buildPromptChain()` (jamais
 * assemblé en prompt final ici). Intègre l'adaptation déterministe calculée
 * par `computeAdaptation()` avant de la transmettre au LLM.
 */
export function buildCoachDomainPrompt(context: CoachContext): string {
  const adaptation = computeAdaptation(context);

  return `${buildWorkoutGenerationPrompt("", {
    goalType: context.goalType,
    difficultyLevel: context.fitnessLevel,
    durationWeeks: context.durationWeeks,
    sessionsPerWeek: context.sessionsPerWeek,
    availableEquipment: context.availableEquipment,
  })}

Ajustement à appliquer : ${adaptation.reason}
- Volume : ${Math.round(adaptation.volumeMultiplier * 100)}% du volume standard
- Intensité : ${Math.round(adaptation.intensityMultiplier * 100)}% de l'intensité standard
- Repos : ${adaptation.restSecondsAdjustment >= 0 ? "+" : ""}${adaptation.restSecondsAdjustment}s par rapport au repos standard
Exercices à éviter (récemment remplacés par l'utilisateur) : ${context.recentExerciseNames.join(", ") || "aucun"}`;
}

export * from "./types";
export * from "./adaptation";
