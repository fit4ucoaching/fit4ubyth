import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminShopService } from "./adminShop.service";
import type { ListOrdersQuery, ListProductsQuery, ToggleProductActiveInput } from "./adminShop.validators";

export class AdminShopController {
  constructor(private readonly service: AdminShopService) {}

  listProducts = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListProductsQuery;
    const { items, total } = await this.service.listProducts(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  toggleProductActive = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.toggleProductActive(req.user!.id, req.params.id as string, req.body as ToggleProductActiveInput));
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListOrdersQuery;
    const { items, total } = await this.service.listOrders(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  getOrderDetail = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getOrderDetail(req.params.id as string));
  };
}
