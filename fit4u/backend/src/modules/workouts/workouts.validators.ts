import { z } from "zod";

export const startWorkoutSchema = z.object({
  programId: z.string().uuid().optional(),
  title: z.string().min(1).max(150),
  exerciseIds: z.array(z.string().uuid()).min(1),
});

export const workoutSessionIdSchema = z.object({
  workoutSessionId: z.string().uuid(),
});

export const finishWorkoutSchema = z.object({
  workoutSessionId: z.string().uuid(),
  caloriesBurned: z.coerce.number().positive().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().uuid(),
        setsCompleted: z.coerce.number().int().min(0),
        repsCompleted: z.coerce.number().int().min(0).optional(),
        weightUsedKg: z.coerce.number().positive().optional(),
        durationSeconds: z.coerce.number().int().positive().optional(),
      }),
    )
    .default([]),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>;
export type FinishWorkoutInput = z.infer<typeof finishWorkoutSchema>;
