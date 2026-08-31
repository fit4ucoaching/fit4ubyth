import { NotFoundError } from "../../errors";
import { auditLogService } from "../../services/auditLog.service";
import type { AdminNutritionRepository } from "./adminNutrition.repository";
import type {
  CreateFoodInput, CreateRecipeInput, ListFoodsQuery,
  ListRecipesQuery, UpdateFoodInput, UpdateRecipeInput,
} from "./adminNutrition.validators";

/** CMS Nutrition (Volume 6, gap comblé) — aliments et recettes, toute écriture journalisée. */
export class AdminNutritionService {
  constructor(private readonly repository: AdminNutritionRepository) {}

  listFoods(query: ListFoodsQuery) {
    return this.repository.listFoods(query);
  }

  listCategories() {
    return this.repository.listCategories();
  }

  async createFood(adminId: string, input: CreateFoodInput) {
    const food = await this.repository.createFood(input);
    await auditLogService.record({ performedBy: adminId, action: "FOOD_CREATED", targetType: "Food", targetId: food.id, after: input });
    return food;
  }

  async updateFood(adminId: string, foodId: string, input: UpdateFoodInput) {
    const before = await this.repository.findFoodById(foodId);
    if (!before) throw new NotFoundError("Aliment introuvable.");
    const updated = await this.repository.updateFood(foodId, input);
    await auditLogService.record({
      performedBy: adminId, action: "FOOD_UPDATED", targetType: "Food", targetId: foodId,
      before: { name: before.name, caloriesPer100g: before.caloriesPer100g.toString() }, after: input,
    });
    return updated;
  }

  async archiveFood(adminId: string, foodId: string) {
    const before = await this.repository.findFoodById(foodId);
    if (!before) throw new NotFoundError("Aliment introuvable.");
    const archived = await this.repository.archiveFood(foodId);
    await auditLogService.record({ performedBy: adminId, action: "FOOD_ARCHIVED", targetType: "Food", targetId: foodId });
    return archived;
  }

  listRecipes(query: ListRecipesQuery) {
    return this.repository.listRecipes(query);
  }

  async createRecipe(adminId: string, input: CreateRecipeInput) {
    const recipe = await this.repository.createRecipe(input);
    await auditLogService.record({ performedBy: adminId, action: "RECIPE_CREATED", targetType: "Recipe", targetId: recipe.id, after: { name: input.name } });
    return recipe;
  }

  async updateRecipe(adminId: string, recipeId: string, input: UpdateRecipeInput) {
    const before = await this.repository.findRecipeById(recipeId);
    if (!before) throw new NotFoundError("Recette introuvable.");
    const updated = await this.repository.updateRecipe(recipeId, input);
    await auditLogService.record({ performedBy: adminId, action: "RECIPE_UPDATED", targetType: "Recipe", targetId: recipeId, before: { name: before.name }, after: input });
    return updated;
  }

  async archiveRecipe(adminId: string, recipeId: string) {
    const before = await this.repository.findRecipeById(recipeId);
    if (!before) throw new NotFoundError("Recette introuvable.");
    const archived = await this.repository.archiveRecipe(recipeId);
    await auditLogService.record({ performedBy: adminId, action: "RECIPE_ARCHIVED", targetType: "Recipe", targetId: recipeId });
    return archived;
  }
}
