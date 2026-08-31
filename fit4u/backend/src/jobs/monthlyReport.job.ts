import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";
import { prisma } from "../database/prisma";

export const monthlyReportWorker = new Worker(
  "monthly-report",
  async () => {
    const since = new Date();
    since.setUTCMonth(since.getUTCMonth() - 1);

    const [newUsers, activeSubscriptions, revenueCents] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.vipAccess.count({ where: { isActive: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } }, _sum: { totalCents: true } }),
    ]);

    logger.info(
      { newUsers, activeSubscriptions, revenueCents: revenueCents._sum.totalCents ?? 0 },
      "Rapport mensuel généré",
    );
  },
  { connection: createRedisConnection() },
);
