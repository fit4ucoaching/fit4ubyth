import type { TeddyFullMemory } from "./types";

/**
 * Formate la mémoire complète en texte compact injecté dans le prompt
 * système (voir `prompts/promptChain.ts`, étage "User Memory"). Un seul
 * bloc structuré plutôt que trois blocs séparés : le LLM raisonne mieux sur
 * un profil unifié que sur des fragments non reliés.
 */
export function formatMemoryForPrompt(memory: TeddyFullMemory): string {
  const { permanent, evolutive, conversational } = memory;

  const lines = [
    `## Profil de ${permanent.firstName}`,
    permanent.goals.length > 0 ? `Objectifs : ${permanent.goals.map((g) => g.title).join(", ")}` : "Aucun objectif défini.",
    permanent.fitnessLevel ? `Niveau : ${permanent.fitnessLevel}` : null,
    `Équipement disponible : ${permanent.availableEquipment.join(", ") || "non renseigné"}`,
    permanent.dietaryPreferences.length > 0 ? `Préférences alimentaires : ${permanent.dietaryPreferences.join(", ")}` : null,
    permanent.declaredInjuries.length > 0
      ? `⚠️ Blessures déclarées (à prendre en compte systématiquement) : ${permanent.declaredInjuries.join(", ")}`
      : null,
    "",
    "## Évolution récente",
    evolutive.currentWeightKg ? `Poids actuel : ${evolutive.currentWeightKg} kg` : null,
    evolutive.recentPerformances.length > 0
      ? `Performances récentes : ${evolutive.recentPerformances.map((p) => `${p.exerciseName} (${p.weightKg ?? "?"}kg×${p.reps ?? "?"})`).join(", ")}`
      : null,
    evolutive.favoriteExerciseNames.length > 0 ? `Exercices favoris : ${evolutive.favoriteExerciseNames.join(", ")}` : null,
    evolutive.replacedExerciseNames.length > 0 ? `Exercices systématiquement remplacés (à éviter en priorité) : ${evolutive.replacedExerciseNames.join(", ")}` : null,
    `Fréquence habituelle : ${evolutive.weeklyFrequency} séances/semaine`,
    evolutive.usualWorkoutHours.length > 0 ? `Horaires habituels : ${evolutive.usualWorkoutHours.join(", ")}` : null,
    "",
    conversational.intelligentSummary ? `## Résumé des échanges précédents\n${conversational.intelligentSummary}` : null,
  ];

  return lines.filter((line): line is string => line !== null).join("\n");
}
