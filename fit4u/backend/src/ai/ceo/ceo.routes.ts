import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { CeoController, ceoChatSchema } from "./ceo.controller";
import { CeoService } from "./ceo.service";

const service = new CeoService();
const controller = new CeoController(service);

/** Montées sous `/admin/teddy-ceo` — permission `teddy.read` (lecture suffit : le CEO ne fait qu'analyser, jamais muter). */
export const ceoRouter: Router = Router();

/** @openapi { "/admin/teddy-ceo/chat": { post: { summary: Conversation avec le Teddy CEO (analyse plateforme), tags: [Admin - Teddy CEO], responses: { 200: { description: OK } } } } } */
ceoRouter.post("/chat", requirePermission("teddy.read"), validateBody(ceoChatSchema), asyncHandler(controller.chat));
