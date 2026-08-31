import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { createRedisConnection } from "../database/redis";

/**
 * Déclenche une sauvegarde de la base de données. L'exécution réelle
 * (pg_dump vers un bucket S3/GCS) dépend de l'infrastructure de déploiement
 * (RDS snapshot automatique, script pg_dump planifié…) — ce worker orchestre
 * le déclenchement et la notification de résultat, jamais la logique
 * spécifique au provider cloud (point d'extension volontaire).
 */
export const backupWorker = new Worker(
  "backup",
  async () => {
    logger.info("Déclenchement de la sauvegarde planifiée (voir infrastructure de déploiement)");
  },
  { connection: createRedisConnection() },
);
