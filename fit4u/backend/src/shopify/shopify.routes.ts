import express, { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ShopifyController } from "./shopify.controller";

const controller = new ShopifyController();

/**
 * Monté à la racine de l'API (voir `routes/index.ts`) — un webhook Shopify
 * n'a par définition aucune session utilisateur, la sécurité repose
 * uniquement sur la vérification de signature HMAC (`shopifyWebhookVerify.ts`).
 * Le déclenchement de synchronisation manuelle vit dans `modules/admin`
 * (chaîne de middlewares auth+rôle+audit complète), jamais ici.
 */
export const shopifyRouter: Router = Router();

/**
 * @openapi
 * /webhooks/shopify:
 *   post:
 *     summary: Webhook Shopify (corps brut, signature HMAC vérifiée)
 *     tags: [Shopify]
 *     security: []
 *     responses: { 200: { description: Reçu } }
 */
shopifyRouter.post("/webhooks/shopify", express.raw({ type: "application/json" }), asyncHandler(controller.webhook));
