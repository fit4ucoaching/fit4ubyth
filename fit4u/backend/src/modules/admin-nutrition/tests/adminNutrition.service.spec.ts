import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../services/auditLog.service", () => ({ auditLogService: { record: vi.fn() } }));

import { AdminNutritionService } from "../adminNutrition.service";
import type { AdminNutritionRepository } from "../adminNutrition.repository";

/** Tests admin-nutrition — vérifie l'archivage (jamais une suppression physique) et la garde 404 sur les écritures. */
function buildRepositoryMock(overrides: Partial<AdminNutritionRepository> = {}): AdminNutritionRepository {
  return {
    findFoodById: vi.fn().mockResolvedValue({ id: "food1", name: "Poulet", caloriesPer100g: { toString: () => "165" } }),
    archiveFood: vi.fn().mockResolvedValue({ id: "food1", deletedAt: new Date() }),
    createFood: vi.fn(),
    updateFood: vi.fn(),
    findRecipeById: vi.fn().mockResolvedValue({ id: "recipe1", name: "Salade de poulet" }),
    archiveRecipe: vi.fn().mockResolvedValue({ id: "recipe1", deletedAt: new Date() }),
    createRecipe: vi.fn(),
    ...overrides,
  } as unknown as AdminNutritionRepository;
}

describe("AdminNutritionService — archivage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("archive un aliment via une mise à jour de deletedAt, jamais une suppression physique (Volume 2 : soft delete)", async () => {
    const repository = buildRepositoryMock();
    const service = new AdminNutritionService(repository);

    const result = await service.archiveFood("admin1", "food1");

    expect(repository.archiveFood).toHaveBeenCalledWith("food1");
    expect(result.deletedAt).toBeInstanceOf(Date);
  });

  it("refuse d'archiver un aliment introuvable (404, jamais un archivage silencieux)", async () => {
    const repository = buildRepositoryMock({ findFoodById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminNutritionService(repository);

    await expect(service.archiveFood("admin1", "inexistant")).rejects.toThrow("introuvable");
  });

  it("refuse de modifier un aliment introuvable", async () => {
    const repository = buildRepositoryMock({ findFoodById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminNutritionService(repository);

    await expect(service.updateFood("admin1", "inexistant", { name: "X" })).rejects.toThrow("introuvable");
  });

  it("refuse d'archiver une recette introuvable", async () => {
    const repository = buildRepositoryMock({ findRecipeById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminNutritionService(repository);

    await expect(service.archiveRecipe("admin1", "inexistant")).rejects.toThrow("introuvable");
  });
});
