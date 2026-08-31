import { z } from "zod";

export const listFoodsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  q: z.string().min(1).max(100).optional(),
});

export const listRecipesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const generateMealPlanSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  dailyCalorieTarget: z.coerce.number().int().positive().optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  mealsPerDay: z.coerce.number().int().min(1).max(6).default(3),
});

export const logWaterSchema = z.object({
  amountMl: z.coerce.number().int().positive().max(5000),
});

export const barcodeSchema = z.object({
  barcode: z.string().min(6).max(50),
});

export type GenerateMealPlanInput = z.infer<typeof generateMealPlanSchema>;
export type LogWaterInput = z.infer<typeof logWaterSchema>;
export type BarcodeInput = z.infer<typeof barcodeSchema>;
