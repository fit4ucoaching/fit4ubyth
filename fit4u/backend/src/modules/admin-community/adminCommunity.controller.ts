import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminCommunityService } from "./adminCommunity.service";
import type { CreateBanInput, ListBansQuery, ListReportsQuery, ReviewReportInput } from "./adminCommunity.validators";

export class AdminCommunityController {
  constructor(private readonly service: AdminCommunityService) {}

  listReports = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListReportsQuery;
    const { items, total } = await this.service.listReports(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  getReport = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getReportWithContent(req.params.id as string));
  };

  reviewReport = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.reviewReport(req.user!.id, req.params.id as string, req.body as ReviewReportInput));
  };

  banUser = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.banUser(req.user!.id, req.body as CreateBanInput), 201);
  };

  liftBan = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.liftBan(req.user!.id, req.params.id as string));
  };

  listBans = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListBansQuery;
    const { items, total } = await this.service.listBans(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };
}
