import type { Prisma } from "@prisma/client";

import { BaseRepository } from "../../repositories/base.repository";

export class NutritionRepository extends BaseRepository {
  async findFoods(params: { page: number; pageSize: number; categoryId?: string; q?: string }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where: Prisma.FoodWhereInput = {
      deletedAt: null,
      categoryId: params.categoryId,
      ...(params.q ? { name: { contains: params.q, mode: "insensitive" } } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.food.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      this.db.food.count({ where }),
    ]);
    return { items, total };
  }

  findFoodByBarcode(barcode: string) {
    return this.db.food.findUnique({ where: { barcode } });
  }

  async findRecipes(params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where: Prisma.RecipeWhereInput = { deletedAt: null };
    const [items, total] = await this.db.$transaction([
      this.db.recipe.findMany({ where, skip, take, include: { ingredients: { include: { food: true } } } }),
      this.db.recipe.count({ where }),
    ]);
    return { items, total };
  }

  createMealPlan(userId: string, input: { startDate: Date; endDate?: Date; dailyCalorieTarget?: number }) {
    return this.db.mealPlan.create({
      data: {
        userId,
        title: `Plan du ${input.startDate.toLocaleDateString("fr-FR")}`,
        startDate: input.startDate,
        endDate: input.endDate,
        dailyCalorieTarget: input.dailyCalorieTarget,
      },
    });
  }

  logWater(userId: string, amountMl: number) {
    return this.db.waterTracking.create({ data: { userId, amountMl, loggedAt: new Date() } });
  }

  getTodayWaterTotal(userId: string) {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    return this.db.waterTracking.aggregate({
      where: { userId, loggedAt: { gte: since } },
      _sum: { amountMl: true },
    });
  }
}
