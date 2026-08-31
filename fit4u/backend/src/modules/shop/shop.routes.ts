import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { ShopController } from "./shop.controller";
import { ShopRepository } from "./shop.repository";
import { ShopService } from "./shop.service";
import { addCartItemSchema, checkoutSchema, listProductsQuerySchema } from "./shop.validators";

const shopRepository = new ShopRepository();
const shopService = new ShopService(shopRepository);
const shopController = new ShopController(shopService);

export const shopRouter = Router();

/** @openapi { "/shop/products": { get: { summary: Catalogue paginé (cache local Shopify), tags: [Shop], responses: { 200: { description: OK } } } } } */
shopRouter.get("/products", validateQuery(listProductsQuerySchema), asyncHandler(shopController.listProducts));

/** @openapi { "/shop/products/{id}": { get: { summary: Détail produit, tags: [Shop], responses: { 200: { description: OK } } } } } */
shopRouter.get("/products/:id", validateParams(idParamSchema), asyncHandler(shopController.getProduct));

/** @openapi { "/shop/cart": { get: { summary: Panier courant, tags: [Shop], responses: { 200: { description: OK } } } } } */
shopRouter.get("/cart", requireAuth, asyncHandler(shopController.getCart));

/** @openapi { "/shop/cart/items": { post: { summary: Ajoute un article au panier, tags: [Shop], responses: { 201: { description: OK } } } } } */
shopRouter.post(
  "/cart/items",
  requireAuth,
  validateBody(addCartItemSchema),
  asyncHandler(shopController.addCartItem),
);

/** @openapi { "/shop/checkout": { post: { summary: Crée la commande (statut PENDING) à partir du panier, tags: [Shop], responses: { 201: { description: OK } } } } } */
shopRouter.post("/checkout", requireAuth, validateBody(checkoutSchema), asyncHandler(shopController.checkout));

/** @openapi { "/shop/orders": { get: { summary: Historique des commandes, tags: [Shop], responses: { 200: { description: OK } } } } } */
shopRouter.get("/orders", requireAuth, asyncHandler(shopController.listOrders));
