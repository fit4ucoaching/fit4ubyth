import { Router } from "express";

import { aiService } from "../../ai/ai.service";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../validators/common.validators";
import { ProgramsController } from "./programs.controller";
import { ProgramsRepository } from "./programs.repository";
import { ProgramsService } from "./programs.service";
import {
  createProgramSchema,
  generateProgramSchema,
  listProgramsQuerySchema,
  updateProgramSchema,
} from "./programs.validators";

const programsRepository = new ProgramsRepository();
// `aiService.generateWorkoutProgram` satisfait structurellement l'interface
// `AIProgramGenerator` (Clean Architecture — voir programs.service.ts).
const programsService = new ProgramsService(programsRepository, aiService);
const programsController = new ProgramsController(programsService);

export const programsRouter = Router();

/**
 * @openapi
 * /programs:
 *   get:
 *     summary: Liste paginée des programmes publiés (templates éditoriaux)
 *     tags: [Programs]
 *     responses: { 200: { description: OK } }
 */
programsRouter.get("/", validateQuery(listProgramsQuerySchema), asyncHandler(programsController.list));

/**
 * @openapi
 * /programs/generate:
 *   post:
 *     summary: Génère un programme personnalisé via Teddy AI (AIWorkoutPlan)
 *     tags: [Programs]
 *     responses: { 201: { description: Plan généré } }
 */
programsRouter.post(
  "/generate",
  requireAuth,
  validateBody(generateProgramSchema),
  asyncHandler(programsController.generate),
);

/**
 * @openapi
 * /programs/{id}:
 *   get:
 *     summary: Détail d'un programme (semaines, jours, exercices)
 *     tags: [Programs]
 *     responses: { 200: { description: OK }, 404: { description: Introuvable } }
 */
programsRouter.get("/:id", validateParams(idParamSchema), asyncHandler(programsController.getById));

/**
 * @openapi
 * /programs:
 *   post:
 *     summary: Crée un programme éditorial (réservé ADMIN/COACH)
 *     tags: [Programs]
 *     responses: { 201: { description: Créé } }
 */
programsRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "COACH"),
  validateBody(createProgramSchema),
  asyncHandler(programsController.create),
);

/**
 * @openapi
 * /programs/{id}:
 *   put:
 *     summary: Met à jour un programme (réservé ADMIN/COACH)
 *     tags: [Programs]
 *     responses: { 200: { description: Mis à jour } }
 */
programsRouter.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "COACH"),
  validateParams(idParamSchema),
  validateBody(updateProgramSchema),
  asyncHandler(programsController.update),
);

/**
 * @openapi
 * /programs/{id}:
 *   delete:
 *     summary: Supprime (soft delete) un programme (réservé ADMIN)
 *     tags: [Programs]
 *     responses: { 204: { description: Supprimé } }
 */
programsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateParams(idParamSchema),
  asyncHandler(programsController.remove),
);
