import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";
import { prisma } from "../database/prisma";

/** Fait transitionner les défis (UPCOMING → ACTIVE → EXPIRED) selon leurs dates. */
export const challengeWorker = new Worker(
  "challenge",
  async () => {
    const now = new Date();

    const [activated, expired] = await Promise.all([
      prisma.challenge.updateMany({
        where: { status: "UPCOMING", startDate: { lte: now } },
        data: { status: "ACTIVE" },
      }),
      prisma.challenge.updateMany({
        where: { status: "ACTIVE", endDate: { lte: now } },
        data: { status: "COMPLETED" },
      }),
    ]);

    logger.info({ activated: activated.count, expired: expired.count }, "Statuts des défis mis à jour");
  },
  { connection: createRedisConnection() },
);
