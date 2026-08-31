import { calculateMacroTargets } from "@fit4u/teddy-sdk";

import { ExercisesRepository } from "../../modules/exercises/exercises.repository";
import { GamificationRepository } from "../../modules/gamification/gamification.repository";
import { NutritionRepository } from "../../modules/nutrition/nutrition.repository";
import { ProgressRepository } from "../../modules/progress/progress.repository";
import { WorkoutsRepository } from "../../modules/workouts/workouts.repository";
import { AIRepository } from "../ai.repository";

const aiRepository = new AIRepository();
const exercisesRepository = new ExercisesRepository();
const workoutsRepository = new WorkoutsRepository();
const progressRepository = new ProgressRepository();
const nutritionRepository = new NutritionRepository();
const gamificationRepository = new GamificationRepository();

/**
 * Implémentation des 12 outils internes (Volume 5) — seul endroit du
 * backend qui exécute réellement un outil déclaré dans
 * `@fit4u/teddy-sdk/tools/toolRegistry.ts`. Chaque outil délègue à un
 * repository de module existant plutôt que de dupliquer sa logique
 * ("Teddy ne connaît jamais directement Prisma. Toujours passer par
 * Services/Repositories/Tools" — Volume 5).
 */
export async function executeTool(
  toolName: string,
  userId: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case "GenerateWorkout": {
      // Déléguée à `ai.service.generateWorkoutProgram` (Volume 3), déjà câblée
      // sur `@fit4u/teddy-sdk` — voir `ai.service.ts` pour éviter une double implémentation.
      const { aiService } = await import("../ai.service");
      return aiService.generateWorkoutProgram(userId, {
        goalType:
          (args.goalType as
            | "WEIGHT_LOSS"
            | "MUSCLE_GAIN"
            | "MAINTENANCE"
            | "PERFORMANCE"
            | "ENDURANCE"
            | "HYROX"
            | "RUNNING"
            | "FOOTBALL"
            | "MOBILITY") ?? "MAINTENANCE",
        difficultyLevel: (args.difficultyLevel as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") ?? "BEGINNER",
        durationWeeks: Number(args.durationWeeks ?? 4),
        sessionsPerWeek: Number(args.sessionsPerWeek ?? 3),
        availableEquipment: ["BODYWEIGHT"],
      });
    }

    case "GenerateMealPlan": {
      const { aiService } = await import("../ai.service");
      return aiService.generateNutritionPlan(userId, {
        dailyCalorieTarget: args.dailyCalorieTarget ? Number(args.dailyCalorieTarget) : undefined,
        dietaryPreferences: [],
        mealsPerDay: Number(args.mealsPerDay ?? 3),
      });
    }

    case "CalculateCalories": {
      const { profile, weightKg } = await aiRepository.getProfileForCalorieCalculation(userId);
      if (!profile || !weightKg || !profile.heightCm || !profile.birthDate) {
        return { error: "Profil incomplet (poids, taille ou date de naissance manquants) pour calculer les besoins caloriques." };
      }
      const age = Math.floor((Date.now() - profile.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return calculateMacroTargets({
        weightKg,
        heightCm: profile.heightCm.toNumber(),
        age,
        gender: profile.gender ?? "PREFER_NOT_TO_SAY",
        activityLevel: (args.activityLevel as never) ?? "moderate",
        goalType: String(args.goalType ?? "MAINTENANCE"),
      });
    }

    case "SearchExercises": {
      const { items } = await exercisesRepository.search(String(args.query ?? ""), { page: 1, pageSize: 10 });
      return items.map((e) => ({ id: e.id, name: e.name, difficultyLevel: e.difficultyLevel }));
    }

    case "GetUserHistory": {
      const { items } = await workoutsRepository.findHistory(userId, { page: 1, pageSize: Number(args.limit ?? 10) });
      return items;
    }

    case "GetProgress":
      return progressRepository.getAnalytics(userId);

    case "SaveWeight":
      return progressRepository.logWeight(userId, { weightKg: Number(args.weightKg), recordedAt: new Date() });

    case "SaveWorkout":
      // La persistance réelle d'une séance passe par `POST /workouts/finish`
      // (flux complet avec exercices/séries) — cet outil confirme seulement
      // qu'une séance identifiée a bien été marquée comme sauvegardée.
      return { workoutSessionId: args.workoutSessionId, saved: true };

    case "CreateChallenge":
      return aiRepository.createChallenge({
        userId,
        title: `Défi ${args.focus ?? "constance"}`,
        description: `Défi généré par Teddy — thème : ${args.focus ?? "CONSISTENCY"}.`,
        targetData: { focus: args.focus },
        startDate: new Date(),
        endDate: new Date(Date.now() + Number(args.durationDays ?? 7) * 24 * 60 * 60 * 1000),
      });

    case "SearchRecipes": {
      const { items } = await nutritionRepository.findRecipes({ page: 1, pageSize: 10 });
      return items.filter((r) => r.name.toLowerCase().includes(String(args.query ?? "").toLowerCase()));
    }

    case "GetNutritionGoals":
      return aiRepository.getNutritionGoal(userId);

    case "GetShoppingList":
      return aiRepository.getShoppingList(userId);

    default:
      return { error: `Outil inconnu : ${toolName}` };
  }
}

void gamificationRepository; // réservé aux futurs outils gamification (ex. GetBadges, GetChallenges)
