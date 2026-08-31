import { z } from "zod";

export const listFoodsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});

export const createFoodSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(150),
  brand: z.string().max(100).optional(),
  caloriesPer100g: z.coerce.number().nonnegative(),
  proteinPer100g: z.coerce.number().nonnegative(),
  carbsPer100g: z.coerce.number().nonnegative(),
  fatPer100g: z.coerce.number().nonnegative(),
  fiberPer100g: z.coerce.number().nonnegative().optional(),
  barcode: z.string().max(50).optional(),
});

export const updateFoodSchema = createFoodSchema.partial();

export const createRecipeSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  instructions: z.string().optional(),
  prepTimeMinutes: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().default(1),
  imageUrl: z.string().url().optional(),
  isPremium: z.boolean().default(false),
  ingredients: z.array(z.object({ foodId: z.string().uuid(), quantityGrams: z.coerce.number().positive() })).min(1),
});

export const updateRecipeSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  prepTimeMinutes: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  isPremium: z.boolean().optional(),
});

export const listRecipesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});

export type ListFoodsQuery = z.infer<typeof listFoodsQuerySchema>;
export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type ListRecipesQuery = z.infer<typeof listRecipesQuerySchema>;
