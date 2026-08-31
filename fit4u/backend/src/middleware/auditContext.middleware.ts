import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      auditContext: { ipAddress?: string; userAgent?: string };
    }
  }
}

/**
 * Attache le contexte d'audit (IP/appareil, Volume 6) à chaque requête admin
 * — évite de relire `req.ip`/`req.headers` dans chaque contrôleur qui
 * journalise une action. Monté uniquement sur le routeur `/admin` (voir
 * `routes/index.ts`), pas globalement (coût nul sur les routes publiques).
 */
export function auditContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.auditContext = {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
  next();
}
