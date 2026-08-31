import { Router } from "express";
import multer from "multer";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { localStorageService } from "../users/storage.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProgressController } from "./progress.controller";
import { ProgressRepository } from "./progress.repository";
import { ProgressService } from "./progress.service";
import { logMeasurementSchema, logWeightSchema } from "./progress.validators";

const progressRepository = new ProgressRepository();
const progressService = new ProgressService(progressRepository, localStorageService);
const progressController = new ProgressController(progressService);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

export const progressRouter = Router();
progressRouter.use(requireAuth);

/** @openapi /progress/weight: post: { summary: Enregistre une pesée, tags: [Progress], responses: { 201: { description: OK } } } */
progressRouter.post("/weight", validateBody(logWeightSchema), asyncHandler(progressController.logWeight));

/** @openapi /progress/measurements: post: { summary: Enregistre une mensuration, tags: [Progress], responses: { 201: { description: OK } } } */
progressRouter.post(
  "/measurements",
  validateBody(logMeasurementSchema),
  asyncHandler(progressController.logMeasurement),
);

/** @openapi /progress/photo: post: { summary: Ajoute une photo de progression, tags: [Progress], responses: { 201: { description: OK } } } */
progressRouter.post("/photo", upload.single("photo"), asyncHandler(progressController.logPhoto));

/** @openapi /progress/history: get: { summary: Historique paginé (poids/mensurations/photos), tags: [Progress], responses: { 200: { description: OK } } } */
progressRouter.get("/history", asyncHandler(progressController.history));

/** @openapi /progress/analytics: get: { summary: Analyse de tendance (poids, objectifs atteints), tags: [Progress], responses: { 200: { description: OK } } } */
progressRouter.get("/analytics", asyncHandler(progressController.analytics));
