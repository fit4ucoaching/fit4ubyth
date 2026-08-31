import { z } from "zod";

export const listProgramsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  goalType: z
    .enum([
      "WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "PERFORMANCE",
      "ENDURANCE", "HYROX", "RUNNING", "FOOTBALL", "MOBILITY",
    ])
    .optional(),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

export const createProgramSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(150),
  description: z.string().optional(),
  goalType: z.enum([
    "WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "PERFORMANCE",
    "ENDURANCE", "HYROX", "RUNNING", "FOOTBALL", "MOBILITY",
  ]),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationWeeks: z.coerce.number().int().positive().max(104),
  coverImageUrl: z.string().url().optional(),
  isPremium: z.boolean().default(false),
});

export const updateProgramSchema = createProgramSchema.partial();

export const generateProgramSchema = z.object({
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

export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type GenerateProgramInput = z.infer<typeof generateProgramSchema>;
