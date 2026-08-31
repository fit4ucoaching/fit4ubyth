import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminUsersController } from "./adminUsers.controller";
import { AdminUsersRepository } from "./adminUsers.repository";
import { AdminUsersService } from "./adminUsers.service";
import { changeRoleSchema, grantPremiumSchema, listUsersQuerySchema } from "./adminUsers.validators";

const adminUsersRepository = new AdminUsersRepository();
const adminUsersService = new AdminUsersService(adminUsersRepository);
const adminUsersController = new AdminUsersController(adminUsersService);

/**
 * Montées sous `/admin/users` par `modules/admin/admin.routes.ts` — guard
 * `requireAuth`/`requireRole` déjà posé par le routeur admin parent, ce
 * fichier n'ajoute que les permissions granulaires (Volume 6 RBAC) par action.
 */
export const adminUsersRouter: Router = Router();

/** @openapi { "/admin/users": { get: { summary: Liste paginée, recherche, filtres, tri, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.get("/", requirePermission("users.read"), validateQuery(listUsersQuerySchema), asyncHandler(adminUsersController.list));

/** @openapi { "/admin/users/{id}": { get: { summary: Fiche utilisateur complète, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.get("/:id", requirePermission("users.read"), validateParams(idParamSchema), asyncHandler(adminUsersController.getById));

/** @openapi { "/admin/users/{id}/suspend": { post: { summary: Suspend le compte, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.post("/:id/suspend", requirePermission("users.suspend"), validateParams(idParamSchema), asyncHandler(adminUsersController.suspend));

/** @openapi { "/admin/users/{id}/reactivate": { post: { summary: Réactive le compte, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.post("/:id/reactivate", requirePermission("users.suspend"), validateParams(idParamSchema), asyncHandler(adminUsersController.reactivate));

/** @openapi { "/admin/users/{id}": { delete: { summary: Supprime (soft delete) le compte, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.delete("/:id", requirePermission("users.delete"), validateParams(idParamSchema), asyncHandler(adminUsersController.remove));

/** @openapi { "/admin/users/{id}/role": { put: { summary: Change le rôle RBAC, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.put(
  "/:id/role",
  requirePermission("users.write"),
  validateParams(idParamSchema),
  validateBody(changeRoleSchema),
  asyncHandler(adminUsersController.changeRole),
);

/** @openapi { "/admin/users/{id}/premium": { put: { summary: Attribue/retire Premium, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.put(
  "/:id/premium",
  requirePermission("users.write"),
  validateParams(idParamSchema),
  validateBody(grantPremiumSchema),
  asyncHandler(adminUsersController.grantPremium),
);

/** @openapi { "/admin/users/{id}/reset-password": { post: { summary: Déclenche un email de réinitialisation, tags: [Admin - Users], responses: { 200: { description: OK } } } } } */
adminUsersRouter.post(
  "/:id/reset-password",
  requirePermission("users.write"),
  validateParams(idParamSchema),
  asyncHandler(adminUsersController.resetPassword),
);
