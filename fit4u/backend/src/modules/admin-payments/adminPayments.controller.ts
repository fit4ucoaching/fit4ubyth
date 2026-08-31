import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminPaymentsService } from "./adminPayments.service";

export class AdminPaymentsController {
  constructor(private readonly service: AdminPaymentsService) {}

  overview = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.overview());
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const { items, total } = await this.service.findPayments({ page, pageSize, status: req.query.status as string | undefined });
    sendPaginated(res, items, { total, page, pageSize });
  };
}
