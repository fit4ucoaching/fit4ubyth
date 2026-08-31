import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { WorkoutsService } from "./workouts.service";
import type { FinishWorkoutInput, StartWorkoutInput } from "./workouts.validators";

export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  start = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.workoutsService.start(req.user!.id, req.body as StartWorkoutInput), 201);
  };

  pause = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.workoutsService.pause(req.user!.id, req.body.workoutSessionId as string));
  };

  resume = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.workoutsService.resume(req.user!.id, req.body.workoutSessionId as string));
  };

  finish = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.workoutsService.finish(req.user!.id, req.body as FinishWorkoutInput));
  };

  history = async (req: Request, res: Response): Promise<void> => {
    const { items, total, page, pageSize } = await this.workoutsService.history(req.user!.id, {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
    sendPaginated(res, items, { total, page, pageSize });
  };

  statistics = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.workoutsService.statistics(req.user!.id));
  };

  personalRecords = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.workoutsService.personalRecords(req.user!.id));
  };
}
