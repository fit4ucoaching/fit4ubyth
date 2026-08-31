import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";
import { prisma } from "../database/prisma";

export const weeklyReportWorker = new Worker(
  "weekly-report",
  async () => {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 7);

    const [newUsers, completedWorkouts, revenueCents] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.workoutSession.count({ where: { completedAt: { gte: since } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } }, _sum: { totalCents: true } }),
    ]);

    logger.info(
      { newUsers, completedWorkouts, revenueCents: revenueCents._sum.totalCents ?? 0 },
      "Rapport hebdomadaire généré",
    );
  },
  { connection: createRedisConnection() },
);
