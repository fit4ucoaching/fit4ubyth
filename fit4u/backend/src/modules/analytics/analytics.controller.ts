import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { AnalyticsService } from "./analytics.service";

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  leaderboard = async (req: Request, res: Response): Promise<void> => {
    const kind = (req.params.kind as string) || "xp";
    const limit = Math.min(Number(req.query.limit ?? 100), 100);
    sendSuccess(res, await this.analyticsService.leaderboard(kind, limit));
  };

  overview = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.analyticsService.overview());
  };
}
