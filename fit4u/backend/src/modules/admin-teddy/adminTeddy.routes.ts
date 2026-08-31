import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminTeddyController, previewPromptSchema } from "./adminTeddy.controller";
import { createPromptVersionSchema, promptKeySchema } from "./adminTeddy.validators";

const controller = new AdminTeddyController();

/**
 * Teddy Control Center (montées sous `/admin/teddy`) — permission
 * `teddy.write` pour toute écriture (créer/activer/désactiver une
 * version). Ne gère QUE les Domain Prompts (Coach/Nutrition/Recovery/
 * Motivation/Analytics/Planner) — aucune route ici ne touche jamais aux
 * prompts d'identité/sécurité, constantes TypeScript non exposées.
 */
export const adminTeddyRouter = Router();

/** @openapi /admin/teddy/prompts/{key}/history: get: { summary: Historique des versions d'un Domain Prompt, tags: [Admin - Teddy], responses: { 200: { description: OK } } } */
adminTeddyRouter.get(
  "/prompts/:key/history",
  requirePermission("teddy.read"),
  validateParams(promptKeySchema),
  asyncHandler(controller.getHistory),
);

/** @openapi /admin/teddy/prompts: post: { summary: Crée une nouvelle version d'un Domain Prompt (inactive par défaut), tags: [Admin - Teddy], responses: { 201: { description: OK } } } */
adminTeddyRouter.post("/prompts", requirePermission("teddy.write"), validateBody(createPromptVersionSchema), asyncHandler(controller.createVersion));

/** @openapi /admin/teddy/prompts/{id}/activate: post: { summary: Déploie une version (désactive l'ancienne active), tags: [Admin - Teddy], responses: { 200: { description: OK } } } */
adminTeddyRouter.post("/prompts/:id/activate", requirePermission("teddy.write"), validateParams(idParamSchema), asyncHandler(controller.activate));

/** @openapi /admin/teddy/prompts/{id}/deactivate: post: { summary: Rollback — désactive une version (repli sur la constante codée), tags: [Admin - Teddy], responses: { 200: { description: OK } } } */
adminTeddyRouter.post("/prompts/:id/deactivate", requirePermission("teddy.write"), validateParams(idParamSchema), asyncHandler(controller.deactivate));

/** @openapi /admin/teddy/prompts/preview: post: { summary: Teste un Domain Prompt candidat sur un message d'exemple, sans l'activer, tags: [Admin - Teddy], responses: { 200: { description: OK } } } */
adminTeddyRouter.post("/prompts/preview", requirePermission("teddy.write"), validateBody(previewPromptSchema), asyncHandler(controller.preview));
