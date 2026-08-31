import type { CoachContext, WorkoutAdaptation } from "./types";

/**
 * Règles d'adaptation déterministes (Volume 5 : "Modifier automatiquement
 * volume, intensité, repos, difficulté, exercices"). Volontairement du code
 * pur (pas un appel LLM) : ces ajustements doivent être PRÉVISIBLES et
 * auditables — le LLM intervient ensuite pour formuler la séance concrète
 * (voir `teddyGenerationService.generateWorkoutPlanData`), pas pour décider
 * du multiplicateur lui-même.
 */
export function computeAdaptation(context: CoachContext): WorkoutAdaptation {
  switch (context.recoveryStatus) {
    case "rest":
      return { volumeMultiplier: 0, intensityMultiplier: 0, restSecondsAdjustment: 0, reason: "Récupération complète recommandée — pas de séance aujourd'hui." };
    case "active_recovery":
      return { volumeMultiplier: 0.4, intensityMultiplier: 0.3, restSecondsAdjustment: 30, reason: "Séance légère pour favoriser la récupération active." };
    case "light":
      return { volumeMultiplier: 0.7, intensityMultiplier: 0.7, restSecondsAdjustment: 15, reason: "Volume et intensité réduits suite à un signal de fatigue." };
    default:
      return { volumeMultiplier: 1, intensityMultiplier: 1, restSecondsAdjustment: 0, reason: "Séance standard." };
  }
}

/** Exclut les exercices récemment remplacés/évités de la sélection (mémoire évolutive). */
export function filterAvoidedExercises<T extends { name: string }>(exercises: T[], avoidedNames: string[]): T[] {
  const avoided = new Set(avoidedNames.map((n) => n.toLowerCase()));
  return exercises.filter((ex) => !avoided.has(ex.name.toLowerCase()));
}
