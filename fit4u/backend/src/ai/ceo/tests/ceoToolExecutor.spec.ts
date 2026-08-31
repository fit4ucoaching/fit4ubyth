import { describe, expect, it, vi } from "vitest";

vi.mock("../ceo.repository");

import { CeoRepository } from "../ceo.repository";
import { executeCeoTool } from "../ceoToolExecutor";

/** Tests de l'exécuteur d'outils CEO — dispatch correct, valeurs par défaut, gestion d'un outil inconnu. */
describe("executeCeoTool", () => {
  it("GetKPISummary délègue au repository sans argument", async () => {
    const spy = vi.mocked(CeoRepository.prototype.getKPISummary).mockResolvedValue({} as never);
    await executeCeoTool("GetKPISummary", {});
    expect(spy).toHaveBeenCalledOnce();
  });

  it("GetChurnRiskUsers applique la valeur par défaut (14 jours) si non fournie", async () => {
    const spy = vi.mocked(CeoRepository.prototype.getChurnRiskUsers).mockResolvedValue([]);
    await executeCeoTool("GetChurnRiskUsers", {});
    expect(spy).toHaveBeenCalledWith(14);
  });

  it("GetChurnRiskUsers respecte un seuil explicite", async () => {
    const spy = vi.mocked(CeoRepository.prototype.getChurnRiskUsers).mockResolvedValue([]);
    await executeCeoTool("GetChurnRiskUsers", { inactivityDays: 30 });
    expect(spy).toHaveBeenCalledWith(30);
  });

  it("GetTopPerformingPrograms applique la valeur par défaut (5) si non fournie", async () => {
    const spy = vi.mocked(CeoRepository.prototype.getTopPerformingPrograms).mockResolvedValue([]);
    await executeCeoTool("GetTopPerformingPrograms", {});
    expect(spy).toHaveBeenCalledWith(5);
  });

  it("un outil inconnu renvoie une erreur structurée, jamais une exception non gérée", async () => {
    const result = await executeCeoTool("OutilInexistant", {});
    expect(result).toEqual({ error: "Outil CEO inconnu : OutilInexistant" });
  });
});
