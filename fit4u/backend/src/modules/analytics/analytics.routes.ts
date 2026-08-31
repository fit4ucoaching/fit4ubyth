import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsService } from "./analytics.service";

const analyticsRepository = new AnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);
const analyticsController = new AnalyticsController(analyticsService);

export const analyticsRouter: Router = Router();
analyticsRouter.use(requireAuth);

/** @openapi { "/analytics/leaderboard/{kind}": { get: { summary: Classement (ex. "xp"), tags: [Analytics], responses: { 200: { description: OK } } } } } */
analyticsRouter.get("/leaderboard/:kind", asyncHandler(analyticsController.leaderboard));

/** @openapi { "/analytics/overview": { get: { summary: Vue d'ensemble de l'engagement (réservé ADMIN), tags: [Analytics], responses: { 200: { description: OK } } } } } */
analyticsRouter.get("/overview", requireRole("ADMIN", "SUPER_ADMIN"), asyncHandler(analyticsController.overview));
