import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";
import { cancelSubscriptionSchema, createSubscriptionSchema } from "./subscriptions.validators";

const repository = new SubscriptionsRepository();
const service = new SubscriptionsService(repository);
const controller = new SubscriptionsController(service, repository);

/** Abonnements digitaux (Volume 7) — distinct de `/payments` (Domaine Boutique). */
export const subscriptionsRouter = Router();

/** @openapi { "/subscriptions": { get: { summary: Abonnement actif de l'utilisateur, tags: [Subscriptions], responses: { 200: { description: OK } } } } } */
subscriptionsRouter.get("/", requireAuth, asyncHandler(controller.current));

/** @openapi { "/subscriptions": { post: { summary: Souscrit à une offre, tags: [Subscriptions], responses: { 201: { description: OK } } } } } */
subscriptionsRouter.post("/", requireAuth, validateBody(createSubscriptionSchema), asyncHandler(controller.create));

/** @openapi { "/subscriptions/cancel": { post: { summary: Annule l'abonnement (cancelAtPeriodEnd par défaut), tags: [Subscriptions], responses: { 200: { description: OK } } } } } */
subscriptionsRouter.post("/cancel", requireAuth, validateBody(cancelSubscriptionSchema), asyncHandler(controller.cancel));
