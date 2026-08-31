import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminShopController } from "./adminShop.controller";
import { AdminShopRepository } from "./adminShop.repository";
import { AdminShopService } from "./adminShop.service";
import { listOrdersQuerySchema, listProductsQuerySchema, toggleProductActiveSchema } from "./adminShop.validators";

const repository = new AdminShopRepository();
const service = new AdminShopService(repository);
const controller = new AdminShopController(service);

/**
 * Montées sous `/admin/shop` par `modules/admin/admin.routes.ts`. La
 * synchronisation catalogue (`POST /admin/shop/sync`) existe déjà
 * directement sur `admin.routes.ts` (Volume 7) — non dupliquée ici.
 */
export const adminShopRouter: Router = Router();

/** @openapi { "/admin/shop/products": { get: { summary: Liste paginée du catalogue (source Shopify), tags: [Admin - Shop], responses: { 200: { description: OK } } } } } */
adminShopRouter.get("/products", requirePermission("shop.read"), validateQuery(listProductsQuerySchema), asyncHandler(controller.listProducts));

/** @openapi { "/admin/shop/products/{id}/active": { put: { summary: Bascule la visibilité locale d'un produit (jamais synchronisé vers Shopify), tags: [Admin - Shop], responses: { 200: { description: OK } } } } } */
adminShopRouter.put(
  "/products/:id/active",
  requirePermission("shop.write"),
  validateParams(idParamSchema),
  validateBody(toggleProductActiveSchema),
  asyncHandler(controller.toggleProductActive),
);

/** @openapi { "/admin/shop/orders": { get: { summary: Liste paginée de toutes les commandes, tags: [Admin - Shop], responses: { 200: { description: OK } } } } } */
adminShopRouter.get("/orders", requirePermission("shop.read"), validateQuery(listOrdersQuerySchema), asyncHandler(controller.listOrders));

/** @openapi { "/admin/shop/orders/{id}": { get: { summary: Détail d'une commande, tags: [Admin - Shop], responses: { 200: { description: OK } } } } } */
adminShopRouter.get("/orders/:id", requirePermission("shop.read"), validateParams(idParamSchema), asyncHandler(controller.getOrderDetail));
