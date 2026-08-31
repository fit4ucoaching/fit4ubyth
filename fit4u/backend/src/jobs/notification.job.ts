import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";
import { prisma } from "../database/prisma";
import { getSocketServer } from "../websocket";

/**
 * Diffuse une notification à un utilisateur : temps réel via Socket.IO si
 * connecté (canal `notifications`), sinon persistée pour affichage au
 * prochain login. Le push mobile réel (APNs/FCM) est un point d'extension
 * (voir `Device.pushToken`) — l'appel au provider tiers est le seul segment
 * non exécutable hors d'un environnement avec les credentials APNs/FCM.
 */
export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    const { userId, type, title, body } = job.data as {
      userId: string;
      type: "PUSH" | "EMAIL" | "IN_APP";
      title: string;
      body: string;
    };

    const setting = await prisma.notificationSetting.findUnique({
      where: { userId_type: { userId, type } },
    });
    if (setting && !setting.isEnabled) {
      logger.debug({ userId, type }, "Notification ignorée (canal désactivé par l'utilisateur)");
      return;
    }

    const io = getSocketServer();
    io?.to(`user:${userId}`).emit("notification", { title, body, type, createdAt: new Date() });

    logger.info({ userId, type }, "Notification diffusée");
  },
  { connection: createRedisConnection() },
);
