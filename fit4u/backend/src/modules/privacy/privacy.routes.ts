import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { PrivacyController } from "./privacy.controller";
import { PrivacyRepository } from "./privacy.repository";
import { PrivacyService } from "./privacy.service";

const repository = new PrivacyRepository();
const service = new PrivacyService(repository);
const controller = new PrivacyController(service);

/** RGPD (Volume 8 §58) — export et suppression, accessibles uniquement par l'utilisateur concerné (jamais par un admin via cette route). */
export const privacyRouter = Router();

/** @openapi { "/privacy/export": { get: { summary: Export complet des données personnelles (RGPD), tags: [Privacy], responses: { 200: { description: OK } } } } } */
privacyRouter.get("/export", requireAuth, asyncHandler(controller.export));

/** @openapi { "/privacy/account": { delete: { summary: Suppression/anonymisation du compte (RGPD), tags: [Privacy], responses: { 200: { description: OK } } } } } */
privacyRouter.delete("/account", requireAuth, asyncHandler(controller.deleteAccount));
