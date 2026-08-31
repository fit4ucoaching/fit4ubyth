import type { Request, Response } from "express";

import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { AdminNutritionService } from "./adminNutrition.service";
import type {
  CreateFoodInput, CreateRecipeInput, ListFoodsQuery,
  ListRecipesQuery, UpdateFoodInput, UpdateRecipeInput,
} from "./adminNutrition.validators";

export class AdminNutritionController {
  constructor(private readonly service: AdminNutritionService) {}

  listFoods = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListFoodsQuery;
    const { items, total } = await this.service.listFoods(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  listCategories = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.listCategories());
  };

  createFood = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.createFood(req.user!.id, req.body as CreateFoodInput), 201);
  };

  updateFood = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.updateFood(req.user!.id, req.params.id as string, req.body as UpdateFoodInput));
  };

  archiveFood = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.archiveFood(req.user!.id, req.params.id as string));
  };

  listRecipes = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListRecipesQuery;
    const { items, total } = await this.service.listRecipes(query);
    sendPaginated(res, items, { total, page: query.page, pageSize: query.pageSize });
  };

  createRecipe = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.createRecipe(req.user!.id, req.body as CreateRecipeInput), 201);
  };

  updateRecipe = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.updateRecipe(req.user!.id, req.params.id as string, req.body as UpdateRecipeInput));
  };

  archiveRecipe = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.archiveRecipe(req.user!.id, req.params.id as string));
  };
}
