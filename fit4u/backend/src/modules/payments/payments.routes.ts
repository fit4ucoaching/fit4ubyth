import express, { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { PaymentsController } from "./payments.controller";
import { PaymentsRepository } from "./payments.repository";
import { PaymentsService } from "./payments.service";
import { createIntentSchema, refundSchema } from "./payments.validators";

const paymentsRepository = new PaymentsRepository();
const paymentsService = new PaymentsService(paymentsRepository);
const paymentsController = new PaymentsController(paymentsService);

export const paymentsRouter = Router();

/** @openapi /payments/create-intent: post: { summary: Crée l'intention de paiement (Stripe/PayPal), tags: [Payments], responses: { 201: { description: OK } } } */
paymentsRouter.post(
  "/create-intent",
  requireAuth,
  validateBody(createIntentSchema),
  asyncHandler(paymentsController.createIntent),
);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     summary: Webhook Stripe (corps brut, signature HMAC vérifiée)
 *     tags: [Payments]
 *     security: []
 *     responses: { 200: { description: Reçu } }
 */
paymentsRouter.post("/webhook", express.raw({ type: "application/json" }), asyncHandler(paymentsController.webhook));

/** @openapi /payments/history: get: { summary: Historique des paiements, tags: [Payments], responses: { 200: { description: OK } } } */
paymentsRouter.get("/history", requireAuth, asyncHandler(paymentsController.history));

/** @openapi /payments/refund: post: { summary: Demande un remboursement, tags: [Payments], responses: { 200: { description: OK } } } */
paymentsRouter.post("/refund", requireAuth, validateBody(refundSchema), asyncHandler(paymentsController.refund));
