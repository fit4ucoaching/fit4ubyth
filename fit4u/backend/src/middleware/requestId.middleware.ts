import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Attribue un identifiant unique à chaque requête — propagé dans tous les
 * logs (`logger.middleware.ts`) et renvoyé dans chaque réponse d'erreur
 * (Volume 3 : format d'erreur uniforme avec `requestId`), pour permettre au
 * support de retrouver une requête précise dans les logs à partir d'une
 * réponse client.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers[REQUEST_ID_HEADER];
  req.requestId = typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, req.requestId);
  next();
}
