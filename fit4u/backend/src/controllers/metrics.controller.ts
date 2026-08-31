import type { Request, Response } from "express";

import { register } from "../utils/metrics";

/** `/metrics` — format Prometheus, consommé par l'infrastructure de monitoring. */
export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
}
