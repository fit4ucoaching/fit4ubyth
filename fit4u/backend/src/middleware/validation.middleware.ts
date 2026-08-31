import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

import { ValidationError } from "../errors";

/**
 * "Aucune donnée non validée n'atteint le service" (Volume 3) — valide et
 * remplace `req.body` / `req.query` / `req.params` par la version
 * parsée/typée de Zod (coercitions incluses, ex. query string → number).
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Corps de requête invalide", {
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new ValidationError("Paramètres de requête invalides", {
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.query = result.data as typeof req.query;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      throw new ValidationError("Paramètres d'URL invalides", {
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.params = result.data as typeof req.params;
    next();
  };
}
