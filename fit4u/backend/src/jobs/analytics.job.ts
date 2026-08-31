import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection, redis, redisKeys } from "../database/redis";
import { prisma } from "../database/prisma";

/** Recalcule les classements (leaderboards) en cache Redis (sorted sets) — voir `services/`. */
export const analyticsWorker = new Worker(
  "analytics",
  async () => {
    const topByXp = await prisma.userXp.findMany({
      orderBy: { totalXp: "desc" },
      take: 100,
      select: { userId: true, totalXp: true },
    });

    if (topByXp.length > 0) {
      const key = redisKeys.leaderboard("xp");
      await redis.del(key);
      await redis.zadd(key, ...topByXp.flatMap((u) => [u.totalXp, u.userId]));
    }

    logger.info({ count: topByXp.length }, "Classement XP recalculé");
  },
  { connection: createRedisConnection() },
);
