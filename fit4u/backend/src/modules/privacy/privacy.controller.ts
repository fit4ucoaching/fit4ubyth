import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { PrivacyService } from "./privacy.service";

export class PrivacyController {
  constructor(private readonly service: PrivacyService) {}

  export = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.exportData(req.user!.id);
    res.setHeader("Content-Disposition", "attachment; filename=fit4u-mes-donnees.json");
    sendSuccess(res, data);
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteAccount(req.user!.id);
    sendSuccess(res, { message: "Compte anonymisé. Vos données financières sont conservées pour obligations légales." });
  };
}
