import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminSubscriptionsService } from "./adminSubscriptions.service";
import type {
  AdminCancelSubscriptionInput,
  CreatePlanInput,
  CreatePriceInput,
  ListSubscriptionsQuery,
  UpdatePlanInput,
} from "./adminSubscriptions.validators";

export class AdminSubscriptionsController {
  constructor(private readonly service: AdminSubscriptionsService) {}

  listPlans = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.listPlans());
  };

  createPlan = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.createPlan(req.user!.id, req.body as CreatePlanInput), 201);
  };

  updatePlan = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.updatePlan(req.user!.id, req.params.id as string, req.body as UpdatePlanInput));
  };

  addPrice = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.addPrice(req.user!.id, req.params.id as string, req.body as CreatePriceInput), 201);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListSubscriptionsQuery;
    const { items, total } = await this.service.listSubscriptions(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.cancelSubscription(req.user!.id, req.params.id as string, req.body as AdminCancelSubscriptionInput));
  };
}
