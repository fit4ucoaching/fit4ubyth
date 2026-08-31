/**
 * Mémoire Teddy — 3 niveaux explicites (Volume 5). Ces interfaces sont le
 * contrat entre le SDK (qui les consomme pour bâtir les prompts) et le
 * backend (qui les alimente depuis Prisma — voir
 * `backend/src/ai/memory/teddyMemoryRepository.ts`). Le SDK ne sait jamais
 * D'OÙ viennent ces données, seulement comment les interpréter.
 */

/**
 * Mémoire permanente — change rarement, définit qui est l'utilisateur.
 * Alimentée par `Profile`, `UserPreference` (Volume 2) + `AIMemory` pour les
 * champs sans table dédiée (blessures déclarées).
 */
export interface TeddyPermanentMemory {
  firstName: string;
  age?: number;
  heightCm?: number;
  gender?: string;
  locale: string;
  goals: { type: string; title: string }[];
  availableEquipment: string[];
  dietaryPreferences: string[];
  declaredInjuries: string[];
  fitnessLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

/**
 * Mémoire évolutive — change à chaque interaction significative. Alimentée
 * par `WeightHistory`, `Measurement`, `PersonalRecord`, `FavoriteExercise`,
 * `WorkoutSession`, `Recipe`/`UserChallenge` (Volume 2).
 */
export interface TeddyEvolutiveMemory {
  currentWeightKg?: number;
  latestMeasurements: { bodyPart: string; valueCm: number }[];
  recentPerformances: { exerciseName: string; weightKg?: number; reps?: number }[];
  favoriteExerciseNames: string[];
  replacedExerciseNames: string[];
  usualWorkoutHours: string[];
  weeklyFrequency: number;
  likedRecipeNames: string[];
  completedChallengeTitles: string[];
}

/**
 * Mémoire conversationnelle — historique + résumé intelligent + contexte
 * récent. Alimentée par `AIConversation`/`AIMessage` (Volume 2).
 */
export interface TeddyConversationalMemory {
  recentMessages: { role: "user" | "teddy" | "system"; content: string }[];
  /** Résumé généré périodiquement (voir `summarize.ts`) — évite de renvoyer tout l'historique brut au LLM. */
  intelligentSummary?: string;
}

/** Assemblage complet — ce que `TeddyCore` reçoit pour construire un prompt. */
export interface TeddyFullMemory {
  permanent: TeddyPermanentMemory;
  evolutive: TeddyEvolutiveMemory;
  conversational: TeddyConversationalMemory;
}
