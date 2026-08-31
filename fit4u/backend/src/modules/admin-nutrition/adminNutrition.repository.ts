import { BaseRepository } from "../../repositories/base.repository";
import type {
  CreateFoodInput, CreateRecipeInput, ListFoodsQuery,
  ListRecipesQuery, UpdateFoodInput, UpdateRecipeInput,
} from "./adminNutrition.validators";

export class AdminNutritionRepository extends BaseRepository {
  async listFoods(query: ListFoodsQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where = {
      deletedAt: null,
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.food.findMany({ where, skip, take, include: { category: true }, orderBy: { name: "asc" } }),
      this.db.food.count({ where }),
    ]);
    return { items, total };
  }

  findFoodById(id: string) {
    return this.db.food.findFirst({ where: { id, deletedAt: null }, include: { category: true } });
  }

  createFood(input: CreateFoodInput) {
    return this.db.food.create({ data: input });
  }

  updateFood(id: string, input: UpdateFoodInput) {
    return this.db.food.update({ where: { id }, data: input });
  }

  /** Archivage (soft delete, Volume 2) — jamais une suppression physique : un aliment peut être référencé par des repas déjà loggés historiquement. */
  archiveFood(id: string) {
    return this.db.food.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  listCategories() {
    return this.db.foodCategory.findMany({ orderBy: { name: "asc" } });
  }

  ensureCategory(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return this.db.foodCategory.upsert({ where: { slug }, create: { name, slug }, update: {} });
  }

  async listRecipes(query: ListRecipesQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where = {
      deletedAt: null,
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.recipe.findMany({ where, skip, take, include: { ingredients: { include: { food: true } } }, orderBy: { createdAt: "desc" } }),
      this.db.recipe.count({ where }),
    ]);
    return { items, total };
  }

  findRecipeById(id: string) {
    return this.db.recipe.findFirst({ where: { id, deletedAt: null }, include: { ingredients: { include: { food: true } } } });
  }

  createRecipe(input: CreateRecipeInput) {
    const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    return this.db.recipe.create({
      data: {
        name: input.name, slug, description: input.description, instructions: input.instructions,
        prepTimeMinutes: input.prepTimeMinutes, servings: input.servings, imageUrl: input.imageUrl, isPremium: input.isPremium,
        ingredients: { create: input.ingredients.map((i) => ({ foodId: i.foodId, quantityGrams: i.quantityGrams })) },
      },
      include: { ingredients: { include: { food: true } } },
    });
  }

  updateRecipe(id: string, input: UpdateRecipeInput) {
    return this.db.recipe.update({ where: { id }, data: input });
  }

  archiveRecipe(id: string) {
    return this.db.recipe.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
