import type { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";

import { env } from "../config/env";
import { createRedisConnection } from "../database/redis";
import { RateLimitError } from "../errors";

const redisClient = createRedisConnection();

/** Limite générale — 100 req / 15 min / IP (valeurs par défaut, voir `config/env.ts`). */
const globalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:global",
  points: env.RATE_LIMIT_MAX,
  duration: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000),
});

/** Limite stricte pour les routes sensibles (login, register, reset password). */
const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:auth",
  points: 10,
  duration: 15 * 60,
});

/**
 * Protection brute force dédiée — compteur PAR COMPTE CIBLÉ (ex. email en
 * tentative de login), distinct du rate limiting générique par IP : un
 * attaquant distribué sur plusieurs IP reste bloqué sur le compte visé.
 */
const bruteForceLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:bruteforce",
  points: env.BRUTE_FORCE_MAX_ATTEMPTS,
  duration: env.BRUTE_FORCE_BLOCK_DURATION_S,
  blockDuration: env.BRUTE_FORCE_BLOCK_DURATION_S,
});

function buildLimiterMiddleware(limiter: RateLimiterRedis, keyFn: (req: Request) => string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await limiter.consume(keyFn(req));
      next();
    } catch {
      next(new RateLimitError());
    }
  };
}

export const globalRateLimiter = buildLimiterMiddleware(globalLimiter, (req) => req.ip ?? "unknown");
export const authRateLimiter = buildLimiterMiddleware(authLimiter, (req) => req.ip ?? "unknown");

/** À appeler explicitement dans `auth.service.ts` avec l'email tenté (pas l'IP). */
export async function consumeBruteForceAttempt(identifier: string): Promise<void> {
  try {
    await bruteForceLimiter.consume(identifier);
  } catch {
    throw new RateLimitError(
      "Trop de tentatives échouées. Compte temporairement bloqué, réessayez plus tard.",
    );
  }
}

export async function resetBruteForceAttempts(identifier: string): Promise<void> {
  await bruteForceLimiter.delete(identifier);
}
