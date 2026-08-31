import { createServer } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase, disconnectDatabase } from "./database/prisma";
import { connectRedis, disconnectRedis } from "./database/redis";
import { startJobs, stopJobs } from "./jobs";
import { startWebsocketServer } from "./websocket";

/**
 * Point d'entrée du backend. Responsabilités (Volume 3) : chargement des
 * variables d'environnement (déjà fait à l'import de `config/env` — fail
 * fast avant toute connexion), connexion PostgreSQL, connexion Redis,
 * démarrage Socket.IO, démarrage des jobs, lancement Express.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);

  startWebsocketServer(httpServer);
  await startJobs();

  httpServer.listen(env.PORT, () => {
    logger.info(
      `Fit4U backend démarré sur le port ${env.PORT} (${env.NODE_ENV}) — API /api/${env.API_VERSION}, docs /docs`,
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Signal ${signal} reçu — arrêt gracieux en cours...`);
    httpServer.close();
    await stopJobs();
    await disconnectRedis();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "Promise rejetée non gérée");
  });
  process.on("uncaughtException", (err) => {
    logger.error({ err }, "Exception non capturée — arrêt du process");
    process.exit(1);
  });
}

void bootstrap();
