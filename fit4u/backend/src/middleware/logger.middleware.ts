import { performance } from "node:perf_hooks";

import type { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger";
import { httpRequestDuration, httpRequestsTotal } from "../utils/metrics";
import { requestContextStorage } from "../utils/requestContext";

/**
 * Log structuré par requête : requestId / userId / route / duration / status
 * (Volume 3, exigence explicite). Aucune donnée sensible (voir `redact` dans
 * `config/logger.ts`).
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();

  requestContextStorage.run({ requestId: req.requestId, userId: req.user?.id }, () => {
    res.on("finish", () => {
      const durationMs = Math.round(performance.now() - start);
      const route = req.route?.path ?? req.path;

      logger.info(
        {
          requestId: req.requestId,
          userId: req.user?.id,
          method: req.method,
          route,
          status: res.statusCode,
          durationMs,
        },
        "request",
      );

      const labels = { method: req.method, route, status: String(res.statusCode) };
      httpRequestDuration.observe(labels, durationMs / 1000);
      httpRequestsTotal.inc(labels);
    });
    next();
  });
}
