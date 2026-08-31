import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";
import { prisma } from "../database/prisma";
import { notificationQueue } from "./queue";

/** Détecte les accès VIP arrivant à expiration sous 3 jours et notifie l'utilisateur. */
export const subscriptionWorker = new Worker(
  "subscription",
  async () => {
    const soon = new Date();
    soon.setUTCDate(soon.getUTCDate() + 3);

    const expiring = await prisma.vipAccess.findMany({
      where: { isActive: true, isLifetime: false, endDate: { lte: soon, gt: new Date() }, userId: { not: null } },
    });

    for (const access of expiring) {
      if (!access.userId) continue;
      await notificationQueue.add("subscription-expiring", {
        userId: access.userId,
        type: "PUSH",
        title: "Votre abonnement Premium expire bientôt",
        body: "Renouvelez votre accès VIP pour ne perdre aucun avantage.",
      });
    }

    logger.info({ count: expiring.length }, "Vérification des abonnements expirants effectuée");
  },
  { connection: createRedisConnection() },
);
