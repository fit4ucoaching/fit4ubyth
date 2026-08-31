import type { NextFunction, Request, Response } from "express";

import type { Permission } from "../config/permissions";
import { AuthenticationError, AuthorizationError } from "../errors";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedUser {
  id: string;
  roles: string[];
  /** Résolues depuis les rôles à l'émission du token (Volume 6 RBAC) — voir `config/permissions.ts`. */
  permissions: string[];
  /**
   * Reflète l'état Premium/VIP au moment de l'émission du token (voir
   * `modules/auth/auth.service.ts` — résolution VIP à chaque login/refresh).
   * Une révocation VIP par un administrateur prend effet au plus tard au
   * prochain refresh token (TTL access token = 15 min par défaut) : compromis
   * assumé pour éviter une requête DB/Redis sur CHAQUE requête authentifiée.
   */
  isPremium: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/** Authentification obligatoire — rejette si le Bearer token est absent/invalide/expiré. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AuthenticationError("Token d'accès manquant.");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roles: payload.roles, permissions: payload.permissions ?? [], isPremium: payload.isPremium };
    next();
  } catch {
    throw new AuthenticationError("Session expirée, veuillez vous reconnecter.");
  }
}

/** Authentification optionnelle — n'échoue jamais, utile pour des routes publiques personnalisables. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length));
      req.user = { id: payload.sub, roles: payload.roles, permissions: payload.permissions ?? [], isPremium: payload.isPremium };
    } catch {
      // Token invalide sur une route à auth optionnelle : on continue anonyme.
    }
  }
  next();
}

/** Restreint l'accès à une liste de rôles RBAC (voir Domaine 2 — `Role`/`UserRole`). */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError();
    }
    const hasRole = req.user.roles.some((r) => roles.includes(r));
    if (!hasRole) {
      throw new AuthorizationError("Rôle insuffisant pour accéder à cette ressource.");
    }
    next();
  };
}

/**
 * Restreint l'accès à une permission granulaire précise (Volume 6 RBAC) —
 * à préférer à `requireRole()` pour toute route du BackOffice : une
 * permission reste stable même si la matrice rôle→permissions évolue
 * (`config/permissions.ts#ROLE_PERMISSIONS`), sans jamais toucher aux routes.
 */
export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError();
    }
    if (!req.user.permissions.includes(permission)) {
      throw new AuthorizationError(`Permission manquante : ${permission}.`);
    }
    next();
  };
}

/** Restreint l'accès aux comptes Premium/VIP (voir `services/vipAccess.service.ts`). */
export function requirePremium(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AuthenticationError();
  }
  if (!req.user.isPremium) {
    throw new AuthorizationError("Fonctionnalité réservée aux membres Premium.");
  }
  next();
}
