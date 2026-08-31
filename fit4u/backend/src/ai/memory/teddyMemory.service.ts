import type { TeddyFullMemory } from "@fit4u/teddy-sdk";

import type { AIRepository } from "../ai.repository";

/**
 * Service spécialisé — mémoire contextuelle de Teddy (Volume 3, explicitement
 * demandé : "Créer un service spécialisé"). Teddy mémorise : objectifs,
 * poids, préférences, matériel, horaires, historique, aliments, blessures
 * déclarées, défis. TOUTES les données transitent par `AIRepository`
 * (lecture cross-domaine en repository, jamais un accès Prisma direct
 * depuis ce service — Clean Architecture stricte).
 *
 * Les "blessures déclarées" n'ont pas de table dédiée au schéma Volume 2
 * (`ExerciseRestriction` est une contre-indication PAR EXERCICE, pas une
 * donnée utilisateur) : elles sont stockées dans `AIMemory` sous la clé
 * `declared_injuries`, exactement l'usage pour lequel cette table
 * clé/valeur flexible a été conçue (voir docs/DATABASE_ARCHITECTURE.md §4.7).
 */
export class TeddyMemoryService {
  constructor(private readonly aiRepository: AIRepository) {}

  async buildContext(userId: string): Promise<TeddyUserContext> {
    const [goals, latestWeight, preferences, recentWorkouts, nutritionGoal, activeChallenges, injuriesMemory] =
      await Promise.all([
        this.aiRepository.getUserGoals(userId),
        this.aiRepository.getLatestWeight(userId),
        this.aiRepository.getPreferences(userId),
        this.aiRepository.getRecentWorkoutSessions(userId),
        this.aiRepository.getNutritionGoal(userId),
        this.aiRepository.getActiveUserChallenges(userId),
        this.aiRepository.getMemory(userId, "declared_injuries"),
      ]);

    return {
      goals: goals.map((g) => ({ type: g.type, title: g.title, targetValue: g.targetValue?.toNumber() })),
      currentWeightKg: latestWeight?.weightKg.toNumber(),
      measurementSystem: preferences?.measurementSystem ?? "METRIC",
      preferredEquipment: preferences?.preferredEquipment ?? [],
      restDayReminder: preferences?.restDayReminder ?? true,
      recentWorkoutCount: recentWorkouts.length,
      lastWorkoutAt: recentWorkouts[0]?.completedAt ?? undefined,
      dailyCalorieTarget: nutritionGoal?.dailyCalories,
      activeChallengeTitles: activeChallenges.map((c) => c.challenge.title),
      declaredInjuries: (injuriesMemory?.value as string[] | undefined) ?? [],
    };
  }

  /**
   * Assemble la mémoire à 3 niveaux (Volume 5 : permanente/évolutive/
   * conversationnelle) consommée par `@fit4u/teddy-sdk` `core/teddyCore`.
   * Distincte de `buildContext()` (Volume 3, conservé pour les générateurs
   * existants `generateWorkoutProgram`/`generateNutritionPlan`/
   * `analyzeProgress`, qui utilisent le format `TeddyUserContext` plus simple).
   *
   * Champs sans source de données dédiée au schéma Volume 2
   * (`replacedExerciseNames`, `usualWorkoutHours`, `likedRecipeNames`) :
   * retournés vides pour l'instant — à alimenter via `AIMemory` (même
   * pattern que `declared_injuries`) une fois ces signaux capturés côté
   * produit (ex. à la confirmation d'un remplacement d'exercice, Volume 4).
   */
  async buildFullMemory(userId: string, conversationId?: string): Promise<TeddyFullMemory> {
    const [profile, goals, latestWeight, preferences, recentWorkouts, activeChallenges, injuriesMemory, personalRecords, favorites, messages] =
      await Promise.all([
        this.aiRepository.getProfileForCalorieCalculation(userId),
        this.aiRepository.getUserGoals(userId),
        this.aiRepository.getLatestWeight(userId),
        this.aiRepository.getPreferences(userId),
        this.aiRepository.getRecentWorkoutSessions(userId),
        this.aiRepository.getActiveUserChallenges(userId),
        this.aiRepository.getMemory(userId, "declared_injuries"),
        this.aiRepository.getRecentPersonalRecords(userId),
        this.aiRepository.getFavoriteExercises(userId),
        conversationId ? this.aiRepository.listMessages(conversationId) : Promise.resolve([]),
      ]);

    return {
      permanent: {
        firstName: profile.profile?.firstName ?? "",
        heightCm: profile.profile?.heightCm?.toNumber(),
        gender: profile.profile?.gender ?? undefined,
        locale: "fr",
        goals: goals.map((g) => ({ type: g.type, title: g.title })),
        availableEquipment: preferences?.preferredEquipment ?? [],
        dietaryPreferences: [],
        declaredInjuries: (injuriesMemory?.value as string[] | undefined) ?? [],
        fitnessLevel: undefined,
      },
      evolutive: {
        currentWeightKg: latestWeight?.weightKg.toNumber(),
        latestMeasurements: [],
        recentPerformances: personalRecords.map((pr) => ({
          exerciseName: pr.exercise.name,
          weightKg: pr.weightKg?.toNumber(),
          reps: pr.reps ?? undefined,
        })),
        favoriteExerciseNames: favorites.map((f) => f.exercise.name),
        replacedExerciseNames: [],
        usualWorkoutHours: [],
        weeklyFrequency: recentWorkouts.length,
        likedRecipeNames: [],
        completedChallengeTitles: activeChallenges.filter((c) => c.completedAt).map((c) => c.challenge.title),
      },
      conversational: {
        recentMessages: messages.map((m) => ({ role: m.role.toLowerCase() as "user" | "teddy" | "system", content: m.content })),
      },
    };
  }

  async declareInjury(userId: string, injury: string): Promise<void> {
    const existing = await this.aiRepository.getMemory(userId, "declared_injuries");
    const current = (existing?.value as string[] | undefined) ?? [];
    if (!current.includes(injury)) {
      await this.aiRepository.setMemory(userId, "declared_injuries", [...current, injury]);
    }
  }

  remember(userId: string, key: string, value: unknown): Promise<unknown> {
    return this.aiRepository.setMemory(userId, key, value);
  }

  recall(userId: string, key: string) {
    return this.aiRepository.getMemory(userId, key);
  }

  /** Formate le contexte en texte compact injecté dans le prompt système (voir `ai.service.ts`). */
  formatForPrompt(context: TeddyUserContext): string {
    const lines = [
      context.goals.length > 0
        ? `Objectifs actuels : ${context.goals.map((g) => g.title).join(", ")}`
        : "Aucun objectif défini pour le moment.",
      context.currentWeightKg ? `Poids actuel : ${context.currentWeightKg} kg` : null,
      `Équipement disponible : ${context.preferredEquipment.join(", ") || "non renseigné"}`,
      `Séances complétées récemment : ${context.recentWorkoutCount}`,
      context.dailyCalorieTarget ? `Objectif calorique quotidien : ${context.dailyCalorieTarget} kcal` : null,
      context.activeChallengeTitles.length > 0
        ? `Défis en cours : ${context.activeChallengeTitles.join(", ")}`
        : null,
      context.declaredInjuries.length > 0
        ? `⚠️ Blessures déclarées à prendre en compte : ${context.declaredInjuries.join(", ")}`
        : null,
    ];
    return lines.filter(Boolean).join("\n");
  }
}

export interface TeddyUserContext {
  goals: { type: string; title: string; targetValue?: number }[];
  currentWeightKg?: number;
  measurementSystem: string;
  preferredEquipment: string[];
  restDayReminder: boolean;
  recentWorkoutCount: number;
  lastWorkoutAt?: Date;
  dailyCalorieTarget?: number;
  activeChallengeTitles: string[];
  declaredInjuries: string[];
}
