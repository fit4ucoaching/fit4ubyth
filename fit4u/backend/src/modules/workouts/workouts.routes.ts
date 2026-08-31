import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody, validateQuery } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { WorkoutsController } from "./workouts.controller";
import { WorkoutsRepository } from "./workouts.repository";
import { WorkoutsService } from "./workouts.service";
import {
  finishWorkoutSchema,
  historyQuerySchema,
  startWorkoutSchema,
  workoutSessionIdSchema,
} from "./workouts.validators";

const workoutsRepository = new WorkoutsRepository();
const workoutsService = new WorkoutsService(workoutsRepository);
const workoutsController = new WorkoutsController(workoutsService);

export const workoutsRouter = Router();
workoutsRouter.use(requireAuth);

/** @openapi /workouts/start: post: { summary: Démarre une séance, tags: [Workouts], responses: { 201: { description: OK } } } */
workoutsRouter.post("/start", validateBody(startWorkoutSchema), asyncHandler(workoutsController.start));

/** @openapi /workouts/pause: post: { summary: Met en pause la séance en cours, tags: [Workouts], responses: { 200: { description: OK } } } */
workoutsRouter.post("/pause", validateBody(workoutSessionIdSchema), asyncHandler(workoutsController.pause));

/** @openapi /workouts/resume: post: { summary: Reprend la séance, tags: [Workouts], responses: { 200: { description: OK } } } */
workoutsRouter.post("/resume", validateBody(workoutSessionIdSchema), asyncHandler(workoutsController.resume));

/** @openapi /workouts/finish: post: { summary: Termine la séance et enregistre les performances, tags: [Workouts], responses: { 200: { description: OK } } } */
workoutsRouter.post("/finish", validateBody(finishWorkoutSchema), asyncHandler(workoutsController.finish));

/** @openapi /workouts/history: get: { summary: Historique paginé des séances complétées, tags: [Workouts], responses: { 200: { description: OK } } } */
workoutsRouter.get("/history", validateQuery(historyQuerySchema), asyncHandler(workoutsController.history));

/** @openapi /workouts/statistics: get: { summary: Statistiques agrégées, tags: [Workouts], responses: { 200: { description: OK } } } */
workoutsRouter.get("/statistics", asyncHandler(workoutsController.statistics));

/** @openapi /workouts/personal-records: get: { summary: Records personnels par exercice, tags: [Workouts], responses: { 200: { description: OK } } } */
workoutsRouter.get("/personal-records", asyncHandler(workoutsController.personalRecords));
