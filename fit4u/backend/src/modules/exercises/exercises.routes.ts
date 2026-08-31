import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { ExercisesController } from "./exercises.controller";
import { ExercisesRepository } from "./exercises.repository";
import { ExercisesService } from "./exercises.service";
import {
  createExerciseSchema,
  favoriteExerciseSchema,
  listExercisesQuerySchema,
  searchExercisesQuerySchema,
  updateExerciseSchema,
} from "./exercises.validators";

const exercisesRepository = new ExercisesRepository();
const exercisesService = new ExercisesService(exercisesRepository);
const exercisesController = new ExercisesController(exercisesService);

export const exercisesRouter: Router = Router();

/**
 * @openapi
 * /exercises:
 *   get:
 *     summary: Liste paginée des exercices (filtres catégorie/muscle/équipement/difficulté)
 *     tags: [Exercises]
 *     responses: { 200: { description: OK } }
 */
exercisesRouter.get(
  "/",
  validateQuery(listExercisesQuerySchema),
  asyncHandler(exercisesController.list),
);

/**
 * @openapi
 * /exercises/search:
 *   get:
 *     summary: Recherche full-text (nom, description)
 *     tags: [Exercises]
 *     responses: { 200: { description: OK } }
 */
exercisesRouter.get(
  "/search",
  validateQuery(searchExercisesQuerySchema),
  asyncHandler(exercisesController.search),
);

/**
 * @openapi
 * /exercises/favorite:
 *   post:
 *     summary: Ajoute/retire un exercice des favoris (toggle)
 *     tags: [Exercises]
 *     responses: { 200: { description: OK } }
 */
exercisesRouter.post(
  "/favorite",
  requireAuth,
  validateBody(favoriteExerciseSchema),
  asyncHandler(exercisesController.favorite),
);

/**
 * @openapi
 * /exercises/favorites:
 *   get:
 *     summary: Liste des exercices favoris de l'utilisateur courant
 *     tags: [Exercises]
 *     responses: { 200: { description: OK } }
 */
exercisesRouter.get("/favorites", requireAuth, asyncHandler(exercisesController.favorites));

/**
 * @openapi
 * /exercises/{id}:
 *   get:
 *     summary: Détail d'un exercice (variantes, médias, contre-indications)
 *     tags: [Exercises]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Introuvable }
 */
exercisesRouter.get("/:id", validateParams(idParamSchema), asyncHandler(exercisesController.getById));

/**
 * @openapi
 * /exercises:
 *   post:
 *     summary: Crée un exercice (réservé aux rôles ADMIN/COACH)
 *     tags: [Exercises]
 *     responses: { 201: { description: Créé } }
 */
exercisesRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "COACH"),
  validateBody(createExerciseSchema),
  asyncHandler(exercisesController.create),
);

/**
 * @openapi
 * /exercises/{id}:
 *   put:
 *     summary: Met à jour un exercice (réservé aux rôles ADMIN/COACH)
 *     tags: [Exercises]
 *     responses: { 200: { description: Mis à jour } }
 */
exercisesRouter.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "COACH"),
  validateParams(idParamSchema),
  validateBody(updateExerciseSchema),
  asyncHandler(exercisesController.update),
);

/**
 * @openapi
 * /exercises/{id}:
 *   delete:
 *     summary: Supprime (soft delete) un exercice (réservé aux rôles ADMIN)
 *     tags: [Exercises]
 *     responses: { 204: { description: Supprimé } }
 */
exercisesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateParams(idParamSchema),
  asyncHandler(exercisesController.remove),
);
