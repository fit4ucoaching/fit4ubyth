import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProfilesController } from "./profiles.controller";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesService } from "./profiles.service";
import {
  updateNotificationSchema,
  updatePreferencesSchema,
  updatePrivacySchema,
} from "./profiles.validators";

const profilesRepository = new ProfilesRepository();
const profilesService = new ProfilesService(profilesRepository);
const profilesController = new ProfilesController(profilesService);

export const profilesRouter = Router();
profilesRouter.use(requireAuth);

/**
 * @openapi
 * /profiles/me/preferences:
 *   get:
 *     summary: Préférences fonctionnelles (unités, objectif, équipement)
 *     tags: [Profiles]
 *     responses: { 200: { description: OK } }
 *   put:
 *     summary: Met à jour les préférences
 *     tags: [Profiles]
 *     responses: { 200: { description: OK } }
 */
profilesRouter.get("/me/preferences", asyncHandler(profilesController.getPreferences));
profilesRouter.put(
  "/me/preferences",
  validateBody(updatePreferencesSchema),
  asyncHandler(profilesController.updatePreferences),
);

/**
 * @openapi
 * /profiles/me/privacy:
 *   get:
 *     summary: Paramètres de confidentialité
 *     tags: [Profiles]
 *     responses: { 200: { description: OK } }
 *   put:
 *     summary: Met à jour la confidentialité
 *     tags: [Profiles]
 *     responses: { 200: { description: OK } }
 */
profilesRouter.get("/me/privacy", asyncHandler(profilesController.getPrivacy));
profilesRouter.put(
  "/me/privacy",
  validateBody(updatePrivacySchema),
  asyncHandler(profilesController.updatePrivacy),
);

/**
 * @openapi
 * /profiles/me/notifications:
 *   get:
 *     summary: Canaux de notification activés (PUSH/EMAIL/IN_APP)
 *     tags: [Profiles]
 *     responses: { 200: { description: OK } }
 *   put:
 *     summary: Active/désactive un canal de notification
 *     tags: [Profiles]
 *     responses: { 200: { description: OK } }
 */
profilesRouter.get("/me/notifications", asyncHandler(profilesController.getNotifications));
profilesRouter.put(
  "/me/notifications",
  validateBody(updateNotificationSchema),
  asyncHandler(profilesController.updateNotification),
);
