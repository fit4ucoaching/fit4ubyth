import type { NextFunction, Request, Response } from "express";

import { AuthenticationError, AuthorizationError } from "../errors";
import { CommunityBanRepository } from "../repositories/communityBan.repository";

const communityBanRepository = new CommunityBanRepository();

/**
 * Applique réellement un bannissement communauté (Volume 6 §"Communauté —
 * Bannissements/Blocages") — vérifié FRAÎCHEMENT à chaque publication,
 * jamais mis en cache dans le JWT (même raisonnement que
 * `requireFeature()`, Volume 7 : un bannissement décidé par un modérateur
 * doit prendre effet immédiatement, pas au prochain refresh token).
 *
 * Restreint UNIQUEMENT la publication (posts/commentaires) — ne bloque
 * jamais la lecture, la messagerie support, ni les autres fonctionnalités
 * de l'app. Une suspension de compte complète reste une action distincte
 * (`User.status`, Volume 3), plus large que ce bannissement ciblé.
 */
export async function requireNotBanned(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    throw new AuthenticationError();
  }

  const activeBan = await communityBanRepository.findActiveBan(req.user.id);
  if (activeBan) {
    throw new AuthorizationError(
      activeBan.expiresAt
        ? `Vous êtes temporairement banni de la communauté jusqu'au ${activeBan.expiresAt.toLocaleDateString("fr-FR")}.`
        : "Vous êtes banni de la communauté.",
    );
  }

  next();
}
