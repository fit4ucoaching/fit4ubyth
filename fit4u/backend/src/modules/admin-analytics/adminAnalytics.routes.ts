import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminAnalyticsController } from "./adminAnalytics.controller";
import { AdminAnalyticsService } from "./adminAnalytics.service";

const service = new AdminAnalyticsService();
const controller = new AdminAnalyticsController(service);

/** Montées sous `/admin/analytics` — permission `analytics.read` (Volume 6, rôle ANALYST dédié). */
export const adminAnalyticsRouter = Router();

/** @openapi { "/admin/analytics/user-growth": { get: { summary: Nouveaux utilisateurs par jour, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/user-growth", requirePermission("analytics.read"), asyncHandler(controller.userGrowth));

/** @openapi { "/admin/analytics/revenue-trend": { get: { summary: Revenu Boutique quotidien, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/revenue-trend", requirePermission("analytics.read"), asyncHandler(controller.revenueTrend));

/** @openapi { "/admin/analytics/workout-engagement": { get: { summary: Séances complétées par jour, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/workout-engagement", requirePermission("analytics.read"), asyncHandler(controller.workoutEngagement));

/** @openapi { "/admin/analytics/teddy-usage": { get: { summary: Messages Teddy par jour, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/teddy-usage", requirePermission("analytics.read"), asyncHandler(controller.teddyUsage));

/** @openapi { "/admin/analytics/retention": { get: { summary: Rétention J7 par cohorte hebdomadaire, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/retention", requirePermission("analytics.read"), asyncHandler(controller.retentionCohorts));

/** @openapi { "/admin/analytics/top-exercises": { get: { summary: Exercices les plus complétés, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/top-exercises", requirePermission("analytics.read"), asyncHandler(controller.topExercises));

/** @openapi { "/admin/analytics/top-programs": { get: { summary: Programmes les plus performants, tags: [Admin - Analytics], responses: { 200: { description: OK } } } } } */
adminAnalyticsRouter.get("/top-programs", requirePermission("analytics.read"), asyncHandler(controller.topPrograms));
