import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";
import { prisma } from "../database/prisma";

/** Rapport quotidien (analytics interne — nombre d'inscriptions, séances, commandes du jour). */
export const dailyReportWorker = new Worker(
  "daily-report",
  async () => {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);

    const [newUsers, completedWorkouts, newOrders] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.workoutSession.count({ where: { completedAt: { gte: since } } }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
    ]);

    logger.info({ newUsers, completedWorkouts, newOrders }, "Rapport quotidien généré");
    // Point d'extension : persister dans une table de reporting dédiée ou
    // envoyer par email à l'équipe via `emailQueue`.
  },
  { connection: createRedisConnection() },
);
