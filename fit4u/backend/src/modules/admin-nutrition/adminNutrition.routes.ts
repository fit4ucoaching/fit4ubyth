import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminNutritionController } from "./adminNutrition.controller";
import { AdminNutritionRepository } from "./adminNutrition.repository";
import { AdminNutritionService } from "./adminNutrition.service";
import {
  createFoodSchema, createRecipeSchema, listFoodsQuerySchema,
  listRecipesQuerySchema, updateFoodSchema, updateRecipeSchema,
} from "./adminNutrition.validators";

const repository = new AdminNutritionRepository();
const service = new AdminNutritionService(repository);
const controller = new AdminNutritionController(service);

/** Montées sous `/admin/nutrition` par `modules/admin/admin.routes.ts` — permission `nutrition.read`/`nutrition.write` (Volume 6, rôle NUTRITION dédié). */
export const adminNutritionRouter: Router = Router();

/** @openapi { "/admin/nutrition/foods": { get: { summary: Liste paginée des aliments, tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.get("/foods", requirePermission("nutrition.read"), validateQuery(listFoodsQuerySchema), asyncHandler(controller.listFoods));

/** @openapi { "/admin/nutrition/categories": { get: { summary: Liste les catégories d'aliments, tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.get("/categories", requirePermission("nutrition.read"), asyncHandler(controller.listCategories));

/** @openapi { "/admin/nutrition/foods": { post: { summary: Crée un aliment, tags: [Admin - Nutrition], responses: { 201: { description: OK } } } } } */
adminNutritionRouter.post("/foods", requirePermission("nutrition.write"), validateBody(createFoodSchema), asyncHandler(controller.createFood));

/** @openapi { "/admin/nutrition/foods/{id}": { put: { summary: Modifie un aliment, tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.put(
  "/foods/:id", requirePermission("nutrition.write"), validateParams(idParamSchema), validateBody(updateFoodSchema), asyncHandler(controller.updateFood),
);

/** @openapi { "/admin/nutrition/foods/{id}": { delete: { summary: Archive un aliment (soft delete), tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.delete("/foods/:id", requirePermission("nutrition.write"), validateParams(idParamSchema), asyncHandler(controller.archiveFood));

/** @openapi { "/admin/nutrition/recipes": { get: { summary: Liste paginée des recettes, tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.get("/recipes", requirePermission("nutrition.read"), validateQuery(listRecipesQuerySchema), asyncHandler(controller.listRecipes));

/** @openapi { "/admin/nutrition/recipes": { post: { summary: Crée une recette (avec ingrédients), tags: [Admin - Nutrition], responses: { 201: { description: OK } } } } } */
adminNutritionRouter.post("/recipes", requirePermission("nutrition.write"), validateBody(createRecipeSchema), asyncHandler(controller.createRecipe));

/** @openapi { "/admin/nutrition/recipes/{id}": { put: { summary: Modifie une recette, tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.put(
  "/recipes/:id", requirePermission("nutrition.write"), validateParams(idParamSchema), validateBody(updateRecipeSchema), asyncHandler(controller.updateRecipe),
);

/** @openapi { "/admin/nutrition/recipes/{id}": { delete: { summary: Archive une recette (soft delete), tags: [Admin - Nutrition], responses: { 200: { description: OK } } } } } */
adminNutritionRouter.delete("/recipes/:id", requirePermission("nutrition.write"), validateParams(idParamSchema), asyncHandler(controller.archiveRecipe));
