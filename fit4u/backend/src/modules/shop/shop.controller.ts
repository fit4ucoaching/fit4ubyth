import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { ShopService } from "./shop.service";
import type { AddCartItemInput, CheckoutInput } from "./shop.validators";

export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  listProducts = async (req: Request, res: Response): Promise<void> => {
    const { items, total } = await this.shopService.products({
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      categoryId: req.query.categoryId as string | undefined,
    });
    sendPaginated(res, items, {
      total,
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
  };

  getProduct = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.shopService.productById(req.params.id as string));
  };

  getCart = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.shopService.cart(req.user!.id));
  };

  addCartItem = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.shopService.addCartItem(req.user!.id, req.body as AddCartItemInput), 201);
  };

  checkout = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.shopService.checkout(req.user!.id, req.body as CheckoutInput), 201);
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const { items, total } = await this.shopService.orders(req.user!.id, {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
    sendPaginated(res, items, {
      total,
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
  };
}
