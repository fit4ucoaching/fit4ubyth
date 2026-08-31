import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/** Évite un try/catch dans chaque contrôleur : transmet les rejets à `error.middleware.ts`. */
export function asyncHandler<Req extends Request = Request>(handler: AsyncRouteHandler<Req>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req as Req, res, next).catch(next);
  };
}
