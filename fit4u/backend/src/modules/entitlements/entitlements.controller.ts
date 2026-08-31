import type { Request, Response } from "express";

import { entitlementService } from "../../services/entitlement.service";
import { sendSuccess } from "../../utils/apiResponse";

export class EntitlementsController {
  me = async (req: Request, res: Response): Promise<void> => {
    const summary = await entitlementService.getSummary({ userId: req.user!.id, roles: req.user!.roles });
    sendSuccess(res, summary);
  };
}
