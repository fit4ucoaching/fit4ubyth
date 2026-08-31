import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { ProgressService } from "./progress.service";
import type { LogMeasurementInput, LogWeightInput } from "./progress.validators";

export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  logWeight = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.progressService.logWeight(req.user!.id, req.body as LogWeightInput), 201);
  };

  logMeasurement = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.progressService.logMeasurement(req.user!.id, req.body as LogMeasurementInput),
      201,
    );
  };

  logPhoto = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.progressService.logPhoto(req.user!.id, req.file, req.body.angle as string | undefined),
      201,
    );
  };

  history = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.progressService.history(req.user!.id, {
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 20),
      }),
    );
  };

  analytics = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.progressService.analytics(req.user!.id));
  };
}
