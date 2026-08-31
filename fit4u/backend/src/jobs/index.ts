import { logger } from "../config/logger";
import "./dailyReport.job";
import "./weeklyReport.job";
import "./monthlyReport.job";
import "./email.job";
import "./notification.job";
import "./backup.job";
import "./analytics.job";
import "./subscription.job";
import "./challenge.job";
import { closeAllQueues, scheduleRecurringJobs } from "./queue";

/**
 * Démarre l'ensemble des workers BullMQ (import = enregistrement du worker,
 * voir chaque `*.job.ts`) et planifie les jobs récurrents (cron). Appelé une
 * seule fois au démarrage par `server.ts`.
 */
export async function startJobs(): Promise<void> {
  await scheduleRecurringJobs();
  logger.info("Jobs BullMQ démarrés (9 workers, jobs récurrents planifiés)");
}

export async function stopJobs(): Promise<void> {
  await closeAllQueues();
  logger.info("Jobs BullMQ arrêtés");
}
