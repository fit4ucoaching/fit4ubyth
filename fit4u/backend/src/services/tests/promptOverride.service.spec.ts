import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../auditLog.service", () => ({ auditLogService: { record: vi.fn() } }));
vi.mock("../../repositories/promptOverride.repository");

import { PromptOverrideRepository } from "../../repositories/promptOverride.repository";
import { PromptOverrideService } from "../promptOverride.service";

/**
 * Tests Teddy Control Center — vérifie la garantie centrale : jamais deux
 * versions actives simultanément pour une même clé (Volume 8 §34-36
 * appliqué aux prompts, comme un déploiement applicatif classique).
 */
describe("PromptOverrideService.activate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("désactive l'ancienne version AVANT d'activer la nouvelle, jamais l'inverse", async () => {
    const callOrder: string[] = [];
    vi.mocked(PromptOverrideRepository.prototype.findById).mockResolvedValue({ id: "v2", key: "COACH", version: 2 } as never);
    vi.mocked(PromptOverrideRepository.prototype.deactivateAllForKey).mockImplementation(async () => { callOrder.push("deactivate"); return {} as never; });
    vi.mocked(PromptOverrideRepository.prototype.activate).mockImplementation(async () => { callOrder.push("activate"); return {} as never; });

    const service = new PromptOverrideService();
    await service.activate("admin1", "v2");

    expect(callOrder).toEqual(["deactivate", "activate"]);
  });

  it("refuse d'activer une version introuvable", async () => {
    vi.mocked(PromptOverrideRepository.prototype.findById).mockResolvedValue(null);
    const service = new PromptOverrideService();

    await expect(service.activate("admin1", "inexistant")).rejects.toThrow("introuvable");
  });
});

describe("PromptOverrideService.resolveActiveOverrides", () => {
  it("renvoie une map clé (minuscule) → contenu, prête à être injectée dans TeddyCoreInput", async () => {
    vi.mocked(PromptOverrideRepository.prototype.findAllActive).mockResolvedValue([
      { key: "COACH", content: "Ton personnalisé Coach" },
      { key: "NUTRITION", content: "Ton personnalisé Nutrition" },
    ] as never);

    const service = new PromptOverrideService();
    const result = await service.resolveActiveOverrides();

    expect(result).toEqual({ coach: "Ton personnalisé Coach", nutrition: "Ton personnalisé Nutrition" });
  });

  it("renvoie un objet vide si aucune override active — le repli sur les constantes reste total", async () => {
    vi.mocked(PromptOverrideRepository.prototype.findAllActive).mockResolvedValue([]);
    const service = new PromptOverrideService();

    expect(await service.resolveActiveOverrides()).toEqual({});
  });
});

describe("PromptOverrideService.createVersion", () => {
  it("crée une nouvelle version SANS l'activer automatiquement (permet de la tester d'abord)", async () => {
    vi.mocked(PromptOverrideRepository.prototype.getNextVersion).mockResolvedValue(3);
    const createSpy = vi.mocked(PromptOverrideRepository.prototype.create).mockResolvedValue({ id: "v3" } as never);
    const activateSpy = vi.mocked(PromptOverrideRepository.prototype.activate);

    const service = new PromptOverrideService();
    await service.createVersion("admin1", "COACH", "Nouveau contenu de prompt");

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ version: 3 }));
    expect(activateSpy).not.toHaveBeenCalled();
  });
});
