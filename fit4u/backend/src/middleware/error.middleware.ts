import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { isProduction } from "../config/env";
import { logger } from "../config/logger";
import { AppError } from "../errors";

/**
 * Gestionnaire d'erreurs central — TOUJOURS le dernier middleware monté
 * (voir `app.ts`). Format de réponse uniforme (Volume 3) :
 *   { success: false, error: { code, message, details, requestId } }
 * Aucune stack technique n'est jamais renvoyée au client, en production
 * comme en développement (elle est journalisée côté serveur uniquement).
 */
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId, code: err.code }, err.message);
    } else {
      logger.warn({ requestId, code: err.code, details: err.details }, err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ requestId, issues: err.issues }, "Erreur de validation non interceptée");
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Données invalides",
        details: { issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
        requestId,
      },
    });
    return;
  }

  // Erreur inattendue (bug) — jamais de détail technique exposé au client.
  logger.error({ err, requestId }, "Erreur non gérée");
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Une erreur inattendue est survenue.",
      details: !isProduction && err instanceof Error ? { message: err.message } : undefined,
      requestId,
    },
  });
}

/** 404 générique pour toute route non déclarée — placé juste avant `errorMiddleware`. */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route introuvable.",
      requestId: req.requestId,
    },
  });
}
