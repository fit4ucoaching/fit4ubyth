import { Router } from "express";
import multer from "multer";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { localStorageService } from "./storage.service";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { updateProfileSchema } from "./users.validators";

const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository, localStorageService);
const usersController = new UsersController(usersService);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const usersRouter: Router = Router();

usersRouter.use(requireAuth);

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Compte + profil de l'utilisateur courant
 *     tags: [Users]
 *     responses:
 *       200: { description: Profil complet }
 */
usersRouter.get("/me", asyncHandler(usersController.me));

/**
 * @openapi
 * /users/me:
 *   put:
 *     summary: Met à jour le profil de l'utilisateur courant
 *     tags: [Users]
 *     responses:
 *       200: { description: Profil mis à jour }
 */
usersRouter.put("/me", validateBody(updateProfileSchema), asyncHandler(usersController.updateMe));

/**
 * @openapi
 * /users/me:
 *   delete:
 *     summary: Supprime (soft delete) le compte de l'utilisateur courant
 *     tags: [Users]
 *     responses:
 *       204: { description: Compte supprimé }
 */
usersRouter.delete("/me", asyncHandler(usersController.deleteMe));

/**
 * @openapi
 * /users/avatar:
 *   post:
 *     summary: Upload de l'avatar (multipart/form-data, champ "avatar")
 *     tags: [Users]
 *     responses:
 *       200: { description: URL de l'avatar mise à jour }
 *       422: { description: Fichier manquant ou format non supporté }
 */
usersRouter.post("/avatar", upload.single("avatar"), asyncHandler(usersController.uploadAvatar));

/**
 * @openapi
 * /users/statistics:
 *   get:
 *     summary: Statistiques agrégées de l'utilisateur (séances, records, XP, posts)
 *     tags: [Users]
 *     responses:
 *       200: { description: Statistiques }
 */
usersRouter.get("/statistics", asyncHandler(usersController.statistics));
