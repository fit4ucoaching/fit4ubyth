import { z } from "zod";

const difficultyEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const listExercisesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  muscleGroupId: z.string().uuid().optional(),
  equipmentId: z.string().uuid().optional(),
  difficultyLevel: difficultyEnum.optional(),
});

export const searchExercisesQuerySchema = z.object({
  q: z.string().min(1).max(100),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  categoryId: z.string().uuid(),
  primaryMuscleId: z.string().uuid(),
  difficultyLevel: difficultyEnum.default("BEGINNER"),
  caloriesPerMinute: z.coerce.number().positive().optional(),
  secondaryMuscleGroupIds: z.array(z.string().uuid()).default([]),
  equipmentIds: z.array(z.string().uuid()).default([]),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const favoriteExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
export type SearchExercisesQuery = z.infer<typeof searchExercisesQuerySchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type FavoriteExerciseInput = z.infer<typeof favoriteExerciseSchema>;
