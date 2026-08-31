import type { Request, Response } from "express";

import { prisma } from "../database/prisma";
import { redis } from "../database/redis";

/**
 * `/health` (liveness) — répond 200 dès que le process Express tourne, sans
 * vérifier les dépendances (utilisé par l'orchestrateur pour redémarrer un
 * container qui ne répond plus du tout).
 */
export async function livenessHandler(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, data: { status: "alive" } });
}

/**
 * `/health/ready` (readiness) — vérifie les dépendances critiques
 * (PostgreSQL, Redis) avant d'annoncer le service prêt à recevoir du trafic
 * (utilisé par le load balancer / l'orchestrateur avant routage).
 */
export async function readinessHandler(_req: Request, res: Response): Promise<void> {
  const checks: Record<string, "ok" | "error"> = { database: "ok", redis: "ok" };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    checks.database = "error";
  }

  try {
    await redis.ping();
  } catch {
    checks.redis = "error";
  }

  const isReady = Object.values(checks).every((status) => status === "ok");
  res.status(isReady ? 200 : 503).json({ success: isReady, data: { status: isReady ? "ready" : "not_ready", checks } });
}
