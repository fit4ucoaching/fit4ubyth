import { Router } from "express";
import multer from "multer";

import { requireAuth } from "../middleware/auth.middleware";
import { requireFeature } from "../middleware/entitlement.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { aiService } from "./ai.service";
import { AIController } from "./ai.controller";
import {
  analyzeProgressSchema,
  chatSchema,
  generateChallengeSchema,
  generateNutritionSchema,
  generateWorkoutSchema,
} from "./ai.validators";

const aiController = new AIController(aiService);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const aiRouter: Router = Router();
aiRouter.use(requireAuth);

/**
 * @openapi
 * /teddy/chat:
 *   post:
 *     summary: Envoie un message à Teddy (texte)
 *     tags: [Teddy AI]
 *     responses: { 200: { description: Réponse de Teddy } }
 */
aiRouter.post("/chat", validateBody(chatSchema), asyncHandler(aiController.chat));

/**
 * @openapi
 * /teddy/voice:
 *   post:
 *     summary: Message vocal à Teddy (multipart/form-data, champ "audio")
 *     tags: [Teddy AI]
 *     responses: { 200: { description: Transcrit et répondu } }
 */
aiRouter.post("/voice", upload.single("audio"), asyncHandler(aiController.voice));

/**
 * @openapi
 * /teddy/generate-workout:
 *   post:
 *     summary: Génère un programme d'entraînement personnalisé (AIWorkoutPlan)
 *     tags: [Teddy AI]
 *     responses: { 201: { description: Plan généré } }
 */
aiRouter.post(
  "/generate-workout",
  validateBody(generateWorkoutSchema),
  asyncHandler(aiController.generateWorkout),
);

/**
 * @openapi
 * /teddy/generate-nutrition:
 *   post:
 *     summary: Génère un plan nutritionnel personnalisé (AINutritionPlan) — fonctionnalité Premium
 *     tags: [Teddy AI]
 *     responses: { 201: { description: Plan généré } }
 */
aiRouter.post(
  "/generate-nutrition",
  requireFeature("nutrition.advanced_ai"),
  validateBody(generateNutritionSchema),
  asyncHandler(aiController.generateNutrition),
);

/**
 * @openapi
 * /teddy/analyze-progress:
 *   post:
 *     summary: Analyse la progression récente et génère une synthèse motivante
 *     tags: [Teddy AI]
 *     responses: { 201: { description: Rapport généré } }
 */
aiRouter.post(
  "/analyze-progress",
  validateBody(analyzeProgressSchema),
  asyncHandler(aiController.analyzeProgress),
);

/**
 * @openapi
 * /teddy/challenge:
 *   post:
 *     summary: Génère un défi personnalisé
 *     tags: [Teddy AI]
 *     responses: { 201: { description: Défi généré } }
 */
aiRouter.post(
  "/challenge",
  validateBody(generateChallengeSchema),
  asyncHandler(aiController.challenge),
);
