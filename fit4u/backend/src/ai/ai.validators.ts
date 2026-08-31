import { z } from "zod";

export const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});

export const generateWorkoutSchema = z.object({
  goalType: z.enum([
    "WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "PERFORMANCE",
    "ENDURANCE", "HYROX", "RUNNING", "FOOTBALL", "MOBILITY",
  ]),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.coerce.number().int().positive().max(52).default(4),
  sessionsPerWeek: z.coerce.number().int().min(1).max(7).default(3),
  availableEquipment: z
    .array(z.enum(["BODYWEIGHT", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BAND", "KETTLEBELL", "CARDIO", "OTHER"]))
    .default(["BODYWEIGHT"]),
});

export const generateNutritionSchema = z.object({
  dailyCalorieTarget: z.coerce.number().int().positive().optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  mealsPerDay: z.coerce.number().int().min(1).max(6).default(3),
});

export const analyzeProgressSchema = z.object({
  periodDays: z.coerce.number().int().positive().max(365).default(30),
});

export const generateChallengeSchema = z.object({
  focus: z.enum(["WORKOUT", "NUTRITION", "CONSISTENCY"]).default("CONSISTENCY"),
  durationDays: z.coerce.number().int().positive().max(90).default(7),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;
export type GenerateNutritionInput = z.infer<typeof generateNutritionSchema>;
export type AnalyzeProgressInput = z.infer<typeof analyzeProgressSchema>;
export type GenerateChallengeInput = z.infer<typeof generateChallengeSchema>;
