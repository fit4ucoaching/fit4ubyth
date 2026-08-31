import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminCommunityController } from "./adminCommunity.controller";
import { AdminCommunityRepository } from "./adminCommunity.repository";
import { AdminCommunityService } from "./adminCommunity.service";
import { createBanSchema, listBansQuerySchema, listReportsQuerySchema, reviewReportSchema } from "./adminCommunity.validators";

const repository = new AdminCommunityRepository();
const service = new AdminCommunityService(repository);
const controller = new AdminCommunityController(service);

/** Montées sous `/admin/community` — permission `community.read`/`community.moderate` (Volume 6, rôle MODERATOR dédié). */
export const adminCommunityRouter = Router();

/** @openapi { "/admin/community/reports": { get: { summary: Liste paginée des signalements, tags: [Admin - Community], responses: { 200: { description: OK } } } } } */
adminCommunityRouter.get("/reports", requirePermission("community.read"), validateQuery(listReportsQuerySchema), asyncHandler(controller.listReports));

/** @openapi { "/admin/community/reports/{id}": { get: { summary: Détail d'un signalement + contenu concerné, tags: [Admin - Community], responses: { 200: { description: OK } } } } } */
adminCommunityRouter.get("/reports/:id", requirePermission("community.read"), validateParams(idParamSchema), asyncHandler(controller.getReport));

/** @openapi { "/admin/community/reports/{id}/review": { post: { summary: Traite un signalement (rejette ou retire le contenu), tags: [Admin - Community], responses: { 200: { description: OK } } } } } */
adminCommunityRouter.post(
  "/reports/:id/review",
  requirePermission("community.moderate"),
  validateParams(idParamSchema),
  validateBody(reviewReportSchema),
  asyncHandler(controller.reviewReport),
);

/** @openapi { "/admin/community/bans": { get: { summary: Liste paginée des bannissements, tags: [Admin - Community], responses: { 200: { description: OK } } } } } */
adminCommunityRouter.get("/bans", requirePermission("community.read"), validateQuery(listBansQuerySchema), asyncHandler(controller.listBans));

/** @openapi { "/admin/community/bans": { post: { summary: Bannit un utilisateur de la communauté (posts/commentaires), tags: [Admin - Community], responses: { 201: { description: OK } } } } } */
adminCommunityRouter.post("/bans", requirePermission("community.moderate"), validateBody(createBanSchema), asyncHandler(controller.banUser));

/** @openapi { "/admin/community/bans/{id}/lift": { post: { summary: Lève un bannissement, tags: [Admin - Community], responses: { 200: { description: OK } } } } } */
adminCommunityRouter.post("/bans/:id/lift", requirePermission("community.moderate"), validateParams(idParamSchema), asyncHandler(controller.liftBan));
