import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../services/auditLog.service", () => ({ auditLogService: { record: vi.fn() } }));

import { AdminShopService } from "../adminShop.service";
import type { AdminShopRepository } from "../adminShop.repository";

/**
 * Tests admin-shop — vérifie surtout que la bascule de visibilité ne
 * touche jamais aux champs synchronisés depuis Shopify (Volume 7 §32),
 * uniquement `isActive`.
 */
function buildRepositoryMock(overrides: Partial<AdminShopRepository> = {}): AdminShopRepository {
  return {
    findProductById: vi.fn().mockResolvedValue({ id: "prod1", name: "T-shirt Fit4U", isActive: true }),
    toggleProductActive: vi.fn().mockResolvedValue({ id: "prod1", isActive: false }),
    findOrderById: vi.fn().mockResolvedValue({ id: "order1", status: "PROCESSING" }),
    listProducts: vi.fn(),
    listOrders: vi.fn(),
    ...overrides,
  } as unknown as AdminShopRepository;
}

describe("AdminShopService.toggleProductActive", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bascule uniquement isActive, jamais un autre champ", async () => {
    const repository = buildRepositoryMock();
    const service = new AdminShopService(repository);

    await service.toggleProductActive("admin1", "prod1", { isActive: false });

    expect(repository.toggleProductActive).toHaveBeenCalledWith("prod1", false);
    expect(repository.toggleProductActive).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: expect.anything() }));
  });

  it("refuse de basculer un produit introuvable", async () => {
    const repository = buildRepositoryMock({ findProductById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminShopService(repository);

    await expect(service.toggleProductActive("admin1", "inexistant", { isActive: true })).rejects.toThrow("introuvable");
  });
});

describe("AdminShopService.getOrderDetail", () => {
  it("refuse une commande introuvable", async () => {
    const repository = buildRepositoryMock({ findOrderById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminShopService(repository);

    await expect(service.getOrderDetail("inexistant")).rejects.toThrow("introuvable");
  });
});
