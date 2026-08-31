import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminUsersService } from "./adminUsers.service";
import type { ChangeRoleInput, GrantPremiumInput, ListUsersQuery } from "./adminUsers.validators";

function contextOf(req: Request) {
  return { adminId: req.user!.id, ipAddress: req.auditContext.ipAddress, userAgent: req.auditContext.userAgent };
}

export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListUsersQuery;
    const { items, total } = await this.service.list(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getFullProfile(req.params.id as string));
  };

  suspend = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.suspend(req.params.id as string, contextOf(req)));
  };

  reactivate = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.reactivate(req.params.id as string, contextOf(req)));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.softDelete(req.params.id as string, contextOf(req)));
  };

  changeRole = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.changeRole(req.params.id as string, req.body as ChangeRoleInput, contextOf(req)));
  };

  grantPremium = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.grantPremium(req.params.id as string, req.body as GrantPremiumInput, contextOf(req)));
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.resetPassword(req.params.id as string, contextOf(req)));
  };
}
