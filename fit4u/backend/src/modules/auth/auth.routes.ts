import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import {
  appleAuthSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validators";

// Composition root du module : instanciation explicite, pas de conteneur DI magique.
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter: Router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Créer un compte (email + mot de passe)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       201: { description: Compte créé, tokens émis }
 *       409: { description: Email déjà utilisé }
 */
authRouter.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.register),
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion par email + mot de passe
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Connexion réussie }
 *       401: { description: Identifiants incorrects }
 *       429: { description: Trop de tentatives (protection brute force) }
 */
authRouter.post("/login", authRateLimiter, validateBody(loginSchema), asyncHandler(authController.login));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Révoque le refresh token fourni
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       204: { description: Déconnecté }
 */
authRouter.post("/logout", validateBody(refreshSchema), asyncHandler(authController.logout));

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Renouvelle les tokens (rotation du refresh token)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Nouveaux tokens émis }
 *       401: { description: Refresh token invalide, révoqué ou expiré }
 */
authRouter.post("/refresh", validateBody(refreshSchema), asyncHandler(authController.refresh));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Envoie un email de réinitialisation (réponse générique anti-énumération)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Email envoyé si le compte existe }
 */
authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe via un token à usage unique
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Mot de passe réinitialisé, toutes les sessions révoquées }
 *       422: { description: Token invalide ou expiré }
 */
authRouter.post(
  "/reset-password",
  authRateLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Valide l'adresse email via le token envoyé à l'inscription
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Email vérifié, compte passé au statut ACTIVE }
 */
authRouter.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  asyncHandler(authController.verifyEmail),
);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     summary: Connexion / inscription via Google OAuth
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Connecté }
 *       401: { description: Jeton Google invalide }
 */
authRouter.post("/google", authRateLimiter, validateBody(googleAuthSchema), asyncHandler(authController.google));

/**
 * @openapi
 * /auth/apple:
 *   post:
 *     summary: Connexion / inscription via Apple Sign In
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Connecté }
 *       401: { description: Jeton Apple invalide }
 */
authRouter.post("/apple", authRateLimiter, validateBody(appleAuthSchema), asyncHandler(authController.apple));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Utilisateur actuellement authentifié
 *     tags: [Auth]
 *     responses:
 *       200: { description: Profil courant }
 *       401: { description: Non authentifié }
 */
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
