import Redis from "ioredis";

import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Client Redis unique — utilisé pour (Volume 3) : sessions, cache API,
 * programmes IA, classements (sorted sets), rate limiting, notifications
 * (pub/sub). Un seul client partagé ; les cas nécessitant des connexions
 * dédiées (BullMQ, Socket.IO adapter) créent leur propre instance dérivée
 * via `createRedisConnection()` ci-dessous plutôt que de réutiliser celle-ci
 * (BullMQ exige des connexions non partagées avec des commandes bloquantes).
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error({ err }, "Erreur de connexion Redis");
});

export function createRedisConnection(): Redis {
  return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
}

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info("Redis connecté");
}

export async function disconnectRedis(): Promise<void> {
  redis.disconnect();
  logger.info("Redis déconnecté");
}

// ── Espaces de clés Redis (convention centralisée — jamais de chaîne en dur
//    ailleurs dans le code, pour éviter les collisions entre domaines) ──
export const redisKeys = {
  session: (sessionId: string) => `fit4u:session:${sessionId}`,
  rateLimit: (identifier: string) => `fit4u:ratelimit:${identifier}`,
  bruteForce: (identifier: string) => `fit4u:bruteforce:${identifier}`,
  cache: (namespace: string, key: string) => `fit4u:cache:${namespace}:${key}`,
  aiPlanDraft: (userId: string) => `fit4u:ai:plan-draft:${userId}`,
  leaderboard: (kind: string) => `fit4u:leaderboard:${kind}`,
  notificationQueue: (userId: string) => `fit4u:notifications:${userId}`,
} as const;
