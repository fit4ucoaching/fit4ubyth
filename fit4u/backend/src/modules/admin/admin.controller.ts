import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminService } from "./admin.service";
import type {
  GrantVipInput,
  ImportVipCsvInput,
  ReplyTicketInput,
  UpdateTicketStatusInput,
  UpsertFeatureFlagInput,
  UpsertSettingInput,
} from "./admin.validators";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  dashboard = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.dashboard());
  };

  grantVip = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.grantVip(req.user!.id, req.body as GrantVipInput), 201);
  };

  revokeVip = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.revokeVip(req.user!.id, req.params.id as string));
  };

  listVip = async (req: Request, res: Response): Promise<void> => {
    const [items, total] = await this.adminService.listVip({
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
    sendPaginated(res, items, {
      total,
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
  };

  importVipCsv = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.importVipCsv(req.user!.id, req.body as ImportVipCsvInput), 201);
  };

  tickets = async (req: Request, res: Response): Promise<void> => {
    const { items, total } = await this.adminService.tickets({
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      status: req.query.status as string | undefined,
    });
    sendPaginated(res, items, {
      total,
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
  };

  replyTicket = async (req: Request, res: Response): Promise<void> => {
    const { content, isInternalNote } = req.body as ReplyTicketInput;
    sendSuccess(res, await this.adminService.replyTicket(req.user!.id, req.params.id as string, content, isInternalNote), 201);
  };

  updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
    const { status, assignedTo } = req.body as UpdateTicketStatusInput;
    sendSuccess(res, await this.adminService.updateTicketStatus(req.params.id as string, status, assignedTo));
  };

  settings = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.settings());
  };

  upsertSetting = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.upsertSetting(req.user!.id, req.body as UpsertSettingInput));
  };

  featureFlags = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.featureFlags());
  };

  upsertFeatureFlag = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.upsertFeatureFlag(req.body as UpsertFeatureFlagInput));
  };

  auditLogs = async (req: Request, res: Response): Promise<void> => {
    const { items, total } = await this.adminService.auditLogs({
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      action: req.query.action as string | undefined,
      targetType: req.query.targetType as string | undefined,
      performedBy: req.query.performedBy as string | undefined,
    });
    sendPaginated(res, items, {
      total,
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
  };

  triggerBackup = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.triggerBackup(req.user!.id), 201);
  };

  backupHistory = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.backupHistory());
  };

  syncShopify = async (req: Request, res: Response): Promise<void> => {
    res.status(202).json({ data: await this.adminService.syncShopify(req.user!.id) });
  };

  teddyCosts = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.adminService.teddyCostSummary(Number(req.query.days ?? 30)));
  };
}
