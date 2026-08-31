import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { SubscriptionsRepository } from "./subscriptions.repository";
import type { SubscriptionsService } from "./subscriptions.service";
import type { CancelSubscriptionInput, CreateSubscriptionInput } from "./subscriptions.validators";

export class SubscriptionsController {
  constructor(
    private readonly service: SubscriptionsService,
    private readonly repository: SubscriptionsRepository,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { email, stripeCustomerId } = await this.repository.findUserBillingInfo(req.user!.id);
    const subscription = await this.service.create(req.user!.id, email, stripeCustomerId, req.body as CreateSubscriptionInput);
    sendSuccess(res, subscription, 201);
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.cancel(req.user!.id, req.body as CancelSubscriptionInput));
  };

  current = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getActive(req.user!.id));
  };
}
