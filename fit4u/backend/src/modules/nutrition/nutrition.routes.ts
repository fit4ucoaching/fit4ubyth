import { Router } from "express";
import multer from "multer";

import { aiService } from "../../ai/ai.service";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { NutritionController } from "./nutrition.controller";
import { NutritionRepository } from "./nutrition.repository";
import { NutritionService } from "./nutrition.service";
import { barcodeSchema, generateMealPlanSchema, logWaterSchema } from "./nutrition.validators";

const nutritionRepository = new NutritionRepository();
const nutritionService = new NutritionService(nutritionRepository, aiService);
const nutritionController = new NutritionController(nutritionService);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

export const nutritionRouter = Router();

/** @openapi { "/foods": { get: { summary: Liste paginée des aliments (recherche, filtre catégorie), tags: [Nutrition], responses: { 200: { description: OK } } } } } */
nutritionRouter.get("/foods", asyncHandler(nutritionController.listFoods));

/** @openapi { "/recipes": { get: { summary: Liste paginée des recettes, tags: [Nutrition], responses: { 200: { description: OK } } } } } */
nutritionRouter.get("/recipes", asyncHandler(nutritionController.listRecipes));

/** @openapi { "/meal-plans/generate": { post: { summary: Génère un plan de repas via Teddy AI, tags: [Nutrition], responses: { 201: { description: OK } } } } } */
nutritionRouter.post(
  "/meal-plans/generate",
  requireAuth,
  validateBody(generateMealPlanSchema),
  asyncHandler(nutritionController.generateMealPlan),
);

/** @openapi { "/nutrition/water": { post: { summary: Enregistre une prise d'eau, tags: [Nutrition], responses: { 201: { description: OK } } } } } */
nutritionRouter.post(
  "/nutrition/water",
  requireAuth,
  validateBody(logWaterSchema),
  asyncHandler(nutritionController.logWater),
);

/** @openapi { "/nutrition/barcode": { post: { summary: Recherche un aliment par code-barres scanné, tags: [Nutrition], responses: { 200: { description: OK }, 404: { description: Introuvable } } } } } */
nutritionRouter.post(
  "/nutrition/barcode",
  requireAuth,
  validateBody(barcodeSchema),
  asyncHandler(nutritionController.barcode),
);

/** @openapi { "/nutrition/analyze-photo": { post: { summary: Analyse une photo de repas (Teddy Vision), tags: [Nutrition], responses: { 200: { description: OK } } } } } */
nutritionRouter.post(
  "/nutrition/analyze-photo",
  requireAuth,
  upload.single("photo"),
  asyncHandler(nutritionController.analyzePhoto),
);
