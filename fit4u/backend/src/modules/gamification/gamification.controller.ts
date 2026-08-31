import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { GamificationService } from "./gamification.service";

export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  profile = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.gamificationService.profile(req.user!.id));
  };

  badges = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.gamificationService.badges(req.user!.id));
  };

  challenges = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.gamificationService.challenges({
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 20),
      }),
    );
  };

  joinChallenge = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.gamificationService.joinChallenge(req.user!.id, req.params.id as string), 201);
  };

  completeChallenge = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.gamificationService.completeChallenge(req.user!.id, req.params.id as string));
  };
}
