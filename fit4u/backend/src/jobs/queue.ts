import { Queue } from "bullmq";

import { createRedisConnection } from "../database/redis";

/**
 * BullMQ — une Queue par famille de jobs (Volume 3). Chaque queue utilise sa
 * propre connexion Redis dédiée (BullMQ l'exige pour les commandes
 * bloquantes), jamais le client Redis partagé de `database/redis.ts`.
 */
const connection = createRedisConnection();

export const dailyReportQueue = new Queue("daily-report", { connection });
export const weeklyReportQueue = new Queue("weekly-report", { connection });
export const monthlyReportQueue = new Queue("monthly-report", { connection });
export const emailQueue = new Queue<{ to: string; template: string; variables: Record<string, unknown> }>(
  "email",
  { connection },
);
export const notificationQueue = new Queue<{
  userId: string;
  type: "PUSH" | "EMAIL" | "IN_APP";
  title: string;
  body: string;
}>("notification", { connection });
export const backupQueue = new Queue("backup", { connection });
export const analyticsQueue = new Queue("analytics", { connection });
export const subscriptionQueue = new Queue("subscription", { connection });
export const challengeQueue = new Queue("challenge", { connection });

export const allQueues = [
  dailyReportQueue,
  weeklyReportQueue,
  monthlyReportQueue,
  emailQueue,
  notificationQueue,
  backupQueue,
  analyticsQueue,
  subscriptionQueue,
  challengeQueue,
];

/** Planifie les jobs récurrents (cron) au démarrage du serveur — voir `jobs/index.ts`. */
export async function scheduleRecurringJobs(): Promise<void> {
  await dailyReportQueue.add(
    "generate-daily-report",
    {},
    { repeat: { pattern: "0 6 * * *" }, jobId: "daily-report-cron" }, // 06:00 UTC chaque jour
  );
  await weeklyReportQueue.add(
    "generate-weekly-report",
    {},
    { repeat: { pattern: "0 7 * * 1" }, jobId: "weekly-report-cron" }, // lundi 07:00 UTC
  );
  await monthlyReportQueue.add(
    "generate-monthly-report",
    {},
    { repeat: { pattern: "0 8 1 * *" }, jobId: "monthly-report-cron" }, // 1er du mois 08:00 UTC
  );
  await backupQueue.add(
    "run-backup",
    {},
    { repeat: { pattern: "0 3 * * *" }, jobId: "backup-cron" }, // 03:00 UTC chaque jour
  );
  await analyticsQueue.add(
    "aggregate-analytics",
    {},
    { repeat: { pattern: "*/30 * * * *" }, jobId: "analytics-cron" }, // toutes les 30 min
  );
  await subscriptionQueue.add(
    "check-expiring-subscriptions",
    {},
    { repeat: { pattern: "0 9 * * *" }, jobId: "subscription-cron" }, // 09:00 UTC chaque jour
  );
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all(allQueues.map((q) => q.close()));
}
