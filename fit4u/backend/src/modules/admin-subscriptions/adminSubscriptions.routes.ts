import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminSubscriptionsController } from "./adminSubscriptions.controller";
import { AdminSubscriptionsRepository } from "./adminSubscriptions.repository";
import { AdminSubscriptionsService } from "./adminSubscriptions.service";
import {
  adminCancelSubscriptionSchema, createPlanSchema, createPriceSchema,
  listSubscriptionsQuerySchema, updatePlanSchema,
} from "./adminSubscriptions.validators";

const repository = new AdminSubscriptionsRepository();
const service = new AdminSubscriptionsService(repository);
const controller = new AdminSubscriptionsController(service);

/** Montées sous `/admin/subscriptions` par `modules/admin/admin.routes.ts`. */
export const adminSubscriptionsRouter = Router();

/** @openapi { "/admin/subscriptions/plans": { get: { summary: Liste le catalogue d'offres, tags: [Admin - Subscriptions], responses: { 200: { description: OK } } } } } */
adminSubscriptionsRouter.get("/plans", requirePermission("subscriptions.read"), asyncHandler(controller.listPlans));

/** @openapi { "/admin/subscriptions/plans": { post: { summary: Crée une offre d'abonnement, tags: [Admin - Subscriptions], responses: { 201: { description: OK } } } } } */
adminSubscriptionsRouter.post("/plans", requirePermission("subscriptions.write"), validateBody(createPlanSchema), asyncHandler(controller.createPlan));

/** @openapi { "/admin/subscriptions/plans/{id}": { put: { summary: Modifie une offre, tags: [Admin - Subscriptions], responses: { 200: { description: OK } } } } } */
adminSubscriptionsRouter.put(
  "/plans/:id",
  requirePermission("subscriptions.write"),
  validateParams(idParamSchema),
  validateBody(updatePlanSchema),
  asyncHandler(controller.updatePlan),
);

/** @openapi { "/admin/subscriptions/plans/{id}/prices": { post: { summary: Ajoute un prix à une offre, tags: [Admin - Subscriptions], responses: { 201: { description: OK } } } } } */
adminSubscriptionsRouter.post(
  "/plans/:id/prices",
  requirePermission("subscriptions.write"),
  validateParams(idParamSchema),
  validateBody(createPriceSchema),
  asyncHandler(controller.addPrice),
);

/** @openapi { "/admin/subscriptions": { get: { summary: Liste tous les abonnements, tags: [Admin - Subscriptions], responses: { 200: { description: OK } } } } } */
adminSubscriptionsRouter.get("/", requirePermission("subscriptions.read"), validateQuery(listSubscriptionsQuerySchema), asyncHandler(controller.list));

/** @openapi { "/admin/subscriptions/{id}/cancel": { post: { summary: Annule un abonnement (action admin, journalisée), tags: [Admin - Subscriptions], responses: { 200: { description: OK } } } } } */
adminSubscriptionsRouter.post(
  "/:id/cancel",
  requirePermission("subscriptions.write"),
  validateParams(idParamSchema),
  validateBody(adminCancelSubscriptionSchema),
  asyncHandler(controller.cancel),
);
