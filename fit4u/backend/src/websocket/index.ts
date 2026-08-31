import type { Server as HttpServer } from "node:http";

import { Server as SocketIOServer } from "socket.io";

import { env, isProduction } from "../config/env";
import { logger } from "../config/logger";
import { registerAnalyticsChannel } from "./channels/analytics.channel";
import { registerChallengesChannel } from "./channels/challenges.channel";
import { registerCommunityChannel } from "./channels/community.channel";
import { registerNotificationsChannel } from "./channels/notifications.channel";
import { registerTeddyChannel } from "./channels/teddy.channel";
import { registerWorkoutChannel } from "./channels/workout.channel";
import { socketAuthMiddleware } from "./socketAuth.middleware";

let io: SocketIOServer | undefined;

/**
 * Démarre Socket.IO sur le serveur HTTP existant (partage le même port que
 * l'API REST — pas de serveur séparé). Chaque canal (Volume 3 : Teddy,
 * Workout, Notifications, Challenges, Community, Analytics) enregistre ses
 * propres handlers dans son fichier dédié sous `channels/`.
 */
export function startWebsocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: isProduction ? env.WEB_APP_URL : true, credentials: true },
    path: "/socket.io",
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    // Room personnelle — permet de cibler un utilisateur précis depuis les
    // jobs (voir `jobs/notification.job.ts`) sans connaître son socket.id.
    void socket.join(`user:${userId}`);

    logger.info({ userId, socketId: socket.id }, "Client Socket.IO connecté");

    registerTeddyChannel(io!, socket);
    registerWorkoutChannel(io!, socket);
    registerNotificationsChannel(io!, socket);
    registerChallengesChannel(io!, socket);
    registerCommunityChannel(io!, socket);
    registerAnalyticsChannel(io!, socket);

    socket.on("disconnect", () => {
      logger.info({ userId, socketId: socket.id }, "Client Socket.IO déconnecté");
    });
  });

  return io;
}

/** Accès à l'instance Socket.IO depuis les jobs/services (ex. diffusion de notifications). */
export function getSocketServer(): SocketIOServer | undefined {
  return io;
}
