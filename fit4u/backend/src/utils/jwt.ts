import jwt from "jsonwebtoken";

import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string; // userId
  roles: string[];
  /** Résolues depuis `roles` à l'émission (Volume 6 RBAC) — évite une requête DB par requête admin. */
  permissions: string[];
  isPremium: boolean;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  jti: string; // identifiant unique du token (pour révocation/rotation)
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
