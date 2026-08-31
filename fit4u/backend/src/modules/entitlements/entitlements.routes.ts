import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { EntitlementsController } from "./entitlements.controller";

const controller = new EntitlementsController();

/**
 * Expose les droits résolus au frontend — jamais utilisée pour AUTORISER
 * quoi que ce soit côté serveur (chaque route sensible utilise
 * `requireFeature()` directement). Sert uniquement à l'affichage
 * conditionnel (masquer un bouton Premium) : "Ne jamais faire confiance au
 * statut Premium fourni par le client" reste vrai même si CE client est
 * celui qui vient de le recevoir (Volume 7 §43).
 */
export const entitlementsRouter = Router();

/** @openapi /entitlements/me: get: { summary: Résumé des droits de l'utilisateur connecté, tags: [Entitlements], responses: { 200: { description: OK } } } */
entitlementsRouter.get("/me", requireAuth, asyncHandler(controller.me));
