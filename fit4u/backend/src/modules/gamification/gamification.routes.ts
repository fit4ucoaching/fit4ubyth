import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateParams } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { GamificationController } from "./gamification.controller";
import { GamificationRepository } from "./gamification.repository";
import { GamificationService } from "./gamification.service";

const gamificationRepository = new GamificationRepository();
const gamificationService = new GamificationService(gamificationRepository);
const gamificationController = new GamificationController(gamificationService);

export const gamificationRouter = Router();
gamificationRouter.use(requireAuth);

/** @openapi /gamification/profile: get: { summary: XP et niveau courant, tags: [Gamification], responses: { 200: { description: OK } } } */
gamificationRouter.get("/profile", asyncHandler(gamificationController.profile));

/** @openapi /gamification/badges: get: { summary: Badges débloqués, tags: [Gamification], responses: { 200: { description: OK } } } */
gamificationRouter.get("/badges", asyncHandler(gamificationController.badges));

/** @openapi /gamification/challenges: get: { summary: Défis actifs/à venir, tags: [Gamification], responses: { 200: { description: OK } } } */
gamificationRouter.get("/challenges", asyncHandler(gamificationController.challenges));

/** @openapi /gamification/challenges/{id}/join: post: { summary: Rejoint un défi, tags: [Gamification], responses: { 201: { description: OK } } } */
gamificationRouter.post(
  "/challenges/:id/join",
  validateParams(idParamSchema),
  asyncHandler(gamificationController.joinChallenge),
);

/** @openapi /gamification/challenges/{id}/complete: post: { summary: Complète un défi (attribue l'XP), tags: [Gamification], responses: { 200: { description: OK } } } */
gamificationRouter.post(
  "/challenges/:id/complete",
  validateParams(idParamSchema),
  asyncHandler(gamificationController.completeChallenge),
);
