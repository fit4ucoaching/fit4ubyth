import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { AdminAnalyticsService } from "./adminAnalytics.service";

function daysParam(req: Request, fallback = 30): number {
  const value = Number(req.query.days ?? fallback);
  return Number.isFinite(value) && value > 0 ? Math.min(value, 365) : fallback;
}

export class AdminAnalyticsController {
  constructor(private readonly service: AdminAnalyticsService) {}

  userGrowth = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getUserGrowth(daysParam(req)));
  };

  revenueTrend = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getRevenueTrend(daysParam(req)));
  };

  workoutEngagement = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getWorkoutEngagement(daysParam(req)));
  };

  teddyUsage = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getTeddyUsage(daysParam(req)));
  };

  retentionCohorts = async (req: Request, res: Response): Promise<void> => {
    const weeksBack = Number(req.query.weeksBack ?? 8);
    sendSuccess(res, await this.service.getRetentionCohorts(Number.isFinite(weeksBack) && weeksBack > 0 ? Math.min(weeksBack, 52) : 8));
  };

  topExercises = async (req: Request, res: Response): Promise<void> => {
    const limit = Number(req.query.limit ?? 5);
    sendSuccess(res, await this.service.getTopExercises(Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 5));
  };

  topPrograms = async (req: Request, res: Response): Promise<void> => {
    const limit = Number(req.query.limit ?? 5);
    sendSuccess(res, await this.service.getTopPrograms(Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 5));
  };
}
