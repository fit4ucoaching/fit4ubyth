import type { Request, Response } from "express";

import { ValidationError } from "../../errors";
import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { NutritionService } from "./nutrition.service";
import type { BarcodeInput, GenerateMealPlanInput, LogWaterInput } from "./nutrition.validators";

export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  listFoods = async (req: Request, res: Response): Promise<void> => {
    const { items, total, page, pageSize } = await this.nutritionService.listFoods({
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      categoryId: req.query.categoryId as string | undefined,
      q: req.query.q as string | undefined,
    });
    sendPaginated(res, items, { total, page, pageSize });
  };

  listRecipes = async (req: Request, res: Response): Promise<void> => {
    const { items, total, page, pageSize } = await this.nutritionService.listRecipes({
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
    sendPaginated(res, items, { total, page, pageSize });
  };

  generateMealPlan = async (req: Request, res: Response): Promise<void> => {
    const result = await this.nutritionService.generateMealPlan(req.user!.id, req.body as GenerateMealPlanInput);
    sendSuccess(res, result, 201);
  };

  logWater = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.nutritionService.logWater(req.user!.id, req.body as LogWaterInput), 201);
  };

  barcode = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.nutritionService.lookupBarcode(req.body as BarcodeInput));
  };

  analyzePhoto = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ValidationError("Aucune image reçue (champ 'photo' attendu).");
    }
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    sendSuccess(res, await this.nutritionService.analyzePhoto(dataUrl));
  };
}
