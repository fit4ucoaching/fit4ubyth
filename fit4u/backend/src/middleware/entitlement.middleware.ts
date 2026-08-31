import type { NextFunction, Request, Response } from "express";

import { AuthenticationError, AuthorizationError } from "../errors";
import { entitlementService } from "../services/entitlement.service";

/**
 * Garde-fou d'accès aux fonctionnalités payantes (Volume 7 §4, §43) — ne
 * repose JAMAIS sur `req.user.isPremium` (valeur potentiellement âgée de
 * jusqu'à 15 minutes, voir `auth.middleware.ts`). Interroge
 * `EntitlementService` fraîchement à chaque requête : un abonnement qui
 * vient d'être annulé par webhook Stripe perd l'accès immédiatement, pas au
 * prochain refresh token.
 *
 * "Ne jamais coder en dur `if user.isPremium === true`" (§4) — cette
 * fonction est le SEUL point d'entrée pour protéger une route par
 * fonctionnalité ; jamais de vérification ad-hoc ailleurs dans le code.
 */
export function requireFeature(featureKey: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const granted = await entitlementService.hasFeature({ userId: req.user.id, roles: req.user.roles }, featureKey);
      if (!granted) {
        throw new AuthorizationError(`Fonctionnalité réservée — mise à niveau requise (${featureKey}).`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
