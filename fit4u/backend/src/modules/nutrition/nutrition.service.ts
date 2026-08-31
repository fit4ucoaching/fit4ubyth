import { NotFoundError } from "../../errors";
import type { NutritionRepository } from "./nutrition.repository";
import type { BarcodeInput, GenerateMealPlanInput, LogWaterInput } from "./nutrition.validators";

/** Contrat minimal attendu du moteur IA (implémenté par `ai/ai.service.ts`) — inversion de dépendance. */
export interface AINutritionGenerator {
  generateNutritionPlan(userId: string, input: GenerateMealPlanInput): Promise<{ aiNutritionPlanId: string }>;
  analyzeFoodPhoto(imageBase64DataUrl: string): Promise<unknown>;
}

export class NutritionService {
  constructor(
    private readonly nutritionRepository: NutritionRepository,
    private readonly aiNutritionGenerator: AINutritionGenerator,
  ) {}

  async listFoods(params: { page: number; pageSize: number; categoryId?: string; q?: string }) {
    const { items, total } = await this.nutritionRepository.findFoods(params);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async listRecipes(params: { page: number; pageSize: number }) {
    const { items, total } = await this.nutritionRepository.findRecipes(params);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  generateMealPlan(userId: string, input: GenerateMealPlanInput) {
    return this.aiNutritionGenerator.generateNutritionPlan(userId, input);
  }

  async logWater(userId: string, input: LogWaterInput) {
    const entry = await this.nutritionRepository.logWater(userId, input.amountMl);
    const total = await this.nutritionRepository.getTodayWaterTotal(userId);
    return { entry, todayTotalMl: total._sum.amountMl ?? 0 };
  }

  async lookupBarcode(input: BarcodeInput) {
    const food = await this.nutritionRepository.findFoodByBarcode(input.barcode);
    if (!food) {
      throw new NotFoundError("Aucun aliment trouvé pour ce code-barres.");
    }
    return food;
  }

  analyzePhoto(imageBase64DataUrl: string) {
    return this.aiNutritionGenerator.analyzeFoodPhoto(imageBase64DataUrl);
  }
}
