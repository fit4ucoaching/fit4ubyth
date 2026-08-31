import { PrismaClient } from "@prisma/client";

import { env, isProduction } from "../config/env";
import { logger } from "../config/logger";

/**
 * Instance Prisma unique de tout le backend — jamais de `new PrismaClient()`
 * ailleurs (Volume 2/3 : "Aucun accès Prisma dans les contrôleurs", et par
 * extension aucune instanciation dupliquée qui épuiserait le pool de
 * connexions PostgreSQL en production).
 *
 * En développement, l'instance est mise en cache sur `globalThis` pour
 * survivre au hot-reload (`tsx watch`) sans multiplier les connexions.
 */
declare global {
  // eslint-disable-next-line no-var
  var __fit4uPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__fit4uPrisma ??
  new PrismaClient({
    log: isProduction
      ? [{ emit: "event", level: "error" }]
      : [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "warn" },
        ],
  });

if (!isProduction) {
  globalThis.__fit4uPrisma = prisma;

  // @ts-expect-error — les types d'événements Prisma ne couvrent pas bien `on("query")` en strict mode
  prisma.$on("query", (e: { query: string; duration: number }) => {
    if (e.duration > 200) {
      logger.warn({ duration: e.duration, query: e.query }, "Requête Prisma lente (> 200ms)");
    }
  });
}

// @ts-expect-error — voir ci-dessus
prisma.$on("error", (e: { message: string }) => {
  logger.error({ err: e.message }, "Erreur Prisma");
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("PostgreSQL connecté (Prisma)");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("PostgreSQL déconnecté (Prisma)");
}

void env; // conserve la dépendance explicite à la config validée avant toute connexion
