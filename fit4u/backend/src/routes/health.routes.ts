import { Router } from "express";

import { livenessHandler, readinessHandler } from "../controllers/health.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const healthRouter: Router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness probe
 *     tags: [Observabilité]
 *     security: []
 *     responses:
 *       200: { description: Le service tourne }
 */
healthRouter.get("/", asyncHandler(livenessHandler));

/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Readiness probe (PostgreSQL + Redis)
 *     tags: [Observabilité]
 *     security: []
 *     responses:
 *       200: { description: Prêt à recevoir du trafic }
 *       503: { description: Une dépendance critique est indisponible }
 */
healthRouter.get("/ready", asyncHandler(readinessHandler));
