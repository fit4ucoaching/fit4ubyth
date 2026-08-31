import { Router } from "express";

import { ADMIN_ROLE_NAMES } from "../../config/permissions";
import { auditContextMiddleware } from "../../middleware/auditContext.middleware";
import { requireAuth, requirePermission, requireRole } from "../../middleware/auth.middleware";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminUsersRouter } from "../admin-users/adminUsers.routes";
import { adminPaymentsRouter } from "../admin-payments/adminPayments.routes";
import { adminSubscriptionsRouter } from "../admin-subscriptions/adminSubscriptions.routes";
import { adminNutritionRouter } from "../admin-nutrition/adminNutrition.routes";
import { adminShopRouter } from "../admin-shop/adminShop.routes";
import { adminCommunityRouter } from "../admin-community/adminCommunity.routes";
import { ceoRouter } from "../../ai/ceo/ceo.routes";
import { adminTeddyRouter } from "../admin-teddy/adminTeddy.routes";
import { adminAnalyticsRouter } from "../admin-analytics/adminAnalytics.routes";
import { AdminController } from "./admin.controller";
import { AdminRepository } from "./admin.repository";
import { AdminService } from "./admin.service";
import {
  createTicketSchema,
  grantVipSchema,
  importVipCsvSchema,
  replyTicketSchema,
  updateTicketStatusSchema,
  upsertFeatureFlagSchema,
  upsertSettingSchema,
} from "./admin.validators";

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

/**
 * Toutes les routes admin sont préfixées `/admin` (voir `routes/index.ts`).
 * Le guard de premier niveau accepte les 8 rôles nommés (Volume 6 RBAC) —
 * l'autorisation FINE est ensuite posée route par route via
 * `requirePermission()` (`config/permissions.ts`), jamais un simple
 * contrôle de rôle générique une fois qu'il existe 8 périmètres différents.
 */
export const adminRouter: Router = Router();
adminRouter.use(requireAuth, requireRole(...ADMIN_ROLE_NAMES), auditContextMiddleware);

adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/payments", adminPaymentsRouter);
adminRouter.use("/subscriptions", adminSubscriptionsRouter);
adminRouter.use("/nutrition", adminNutritionRouter);
adminRouter.use("/shop", adminShopRouter);
adminRouter.use("/community", adminCommunityRouter);
adminRouter.use("/teddy-ceo", ceoRouter);
adminRouter.use("/teddy", adminTeddyRouter);
adminRouter.use("/analytics", adminAnalyticsRouter);

/** @openapi { "/admin/dashboard": { get: { summary: Statistiques globales, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/dashboard", requirePermission("analytics.read"), asyncHandler(adminController.dashboard));

/** @openapi { "/admin/vip": { get: { summary: Liste paginée des accès VIP, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/vip", requirePermission("vip.read"), asyncHandler(adminController.listVip));

/** @openapi { "/admin/vip": { post: { summary: Accorde un accès VIP par email, tags: [Admin], responses: { 201: { description: OK } } } } } */
adminRouter.post("/vip", requirePermission("vip.write"), validateBody(grantVipSchema), asyncHandler(adminController.grantVip));

/** @openapi { "/admin/vip/import": { post: { summary: Import CSV d'adresses VIP en masse, tags: [Admin], responses: { 201: { description: OK } } } } } */
adminRouter.post(
  "/vip/import",
  requirePermission("vip.write"),
  validateBody(importVipCsvSchema),
  asyncHandler(adminController.importVipCsv),
);

/** @openapi { "/admin/vip/{id}": { delete: { summary: Révoque un accès VIP, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.delete("/vip/:id", requirePermission("vip.write"), validateParams(idParamSchema), asyncHandler(adminController.revokeVip));

/** @openapi { "/admin/support/tickets": { get: { summary: Liste paginée des tickets support, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/support/tickets", requirePermission("support.read"), asyncHandler(adminController.tickets));

/** @openapi { "/admin/support/tickets/{id}/reply": { post: { summary: Répond à un ticket (ou note interne), tags: [Admin], responses: { 201: { description: OK } } } } } */
adminRouter.post(
  "/support/tickets/:id/reply",
  requirePermission("support.write"),
  validateParams(idParamSchema),
  validateBody(replyTicketSchema),
  asyncHandler(adminController.replyTicket),
);

/** @openapi { "/admin/support/tickets/{id}/status": { put: { summary: Change le statut/l'assignation d'un ticket, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.put(
  "/support/tickets/:id/status",
  requirePermission("support.write"),
  validateParams(idParamSchema),
  validateBody(updateTicketStatusSchema),
  asyncHandler(adminController.updateTicketStatus),
);

/** @openapi { "/admin/settings": { get: { summary: Liste des paramètres système, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/settings", requirePermission("settings.read"), asyncHandler(adminController.settings));

/** @openapi { "/admin/settings": { put: { summary: Crée/modifie un paramètre système, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.put("/settings", requirePermission("settings.write"), validateBody(upsertSettingSchema), asyncHandler(adminController.upsertSetting));

/** @openapi { "/admin/feature-flags": { get: { summary: Liste des feature flags, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/feature-flags", requirePermission("feature_flags.read"), asyncHandler(adminController.featureFlags));

/** @openapi { "/admin/feature-flags": { put: { summary: Crée/modifie un feature flag (avec ciblage), tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.put(
  "/feature-flags",
  requirePermission("feature_flags.write"),
  validateBody(upsertFeatureFlagSchema),
  asyncHandler(adminController.upsertFeatureFlag),
);

/** @openapi { "/admin/audit-logs": { get: { summary: Journal d'audit (qui/quand/quoi/avant/après/IP), tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/audit-logs", requirePermission("audit.read"), asyncHandler(adminController.auditLogs));

/** @openapi { "/admin/shop/sync": { post: { summary: Déclenche une synchronisation manuelle du catalogue Shopify, tags: [Admin - Shop], responses: { 202: { description: Acceptée } } } } } */
adminRouter.post("/shop/sync", requirePermission("shop.write"), asyncHandler(adminController.syncShopify));

/** @openapi { "/admin/teddy/costs": { get: { summary: Résumé des coûts IA Teddy sur une période, tags: [Admin - Teddy], responses: { 200: { description: OK } } } } } */
adminRouter.get("/teddy/costs", requirePermission("teddy.read"), asyncHandler(adminController.teddyCosts));

/** @openapi { "/admin/backups/trigger": { post: { summary: Déclenche une sauvegarde immédiate, tags: [Admin], responses: { 201: { description: OK } } } } } */
adminRouter.post("/backups/trigger", requirePermission("backups.write"), asyncHandler(adminController.triggerBackup));

/** @openapi { "/admin/backups/history": { get: { summary: Historique des sauvegardes récentes, tags: [Admin], responses: { 200: { description: OK } } } } } */
adminRouter.get("/backups/history", requirePermission("backups.read"), asyncHandler(adminController.backupHistory));

void createTicketSchema; // schéma exposé pour les futures routes utilisateur "créer un ticket" (module support côté app, hors périmètre /admin)
