import { describe, expect, it } from "vitest";

import { detectPlatformAnomalies } from "../ceoAnomalyDetection";

/**
 * Tests de détection d'anomalies plateforme — fonction pure, dédiée
 * (jamais un détournement de `detectTrend()` du SDK, conçu pour
 * l'adhérence d'un utilisateur individuel, sémantiquement incompatible).
 */
describe("detectPlatformAnomalies", () => {
  it("signale une baisse de revenu au-delà du seuil", () => {
    const result = detectPlatformAnomalies([{ name: "Revenu", currentValue: 7000, previousValue: 10000 }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ metric: "Revenu", direction: "baisse", changePercent: -30 });
  });

  it("signale une hausse au-delà du seuil", () => {
    const result = detectPlatformAnomalies([{ name: "Nouveaux utilisateurs", currentValue: 150, previousValue: 100 }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ direction: "hausse", changePercent: 50 });
  });

  it("ignore une variation sous le seuil (bruit normal)", () => {
    const result = detectPlatformAnomalies([{ name: "Séances", currentValue: 105, previousValue: 100 }]);
    expect(result).toHaveLength(0);
  });

  it("respecte un seuil personnalisé", () => {
    const metrics = [{ name: "Séances", currentValue: 105, previousValue: 100 }];
    expect(detectPlatformAnomalies(metrics, 20)).toHaveLength(0);
    expect(detectPlatformAnomalies(metrics, 3)).toHaveLength(1);
  });

  it("exclut une métrique dont la valeur précédente est 0 (division indéfinie), jamais une fausse anomalie infinie", () => {
    const result = detectPlatformAnomalies([{ name: "Nouveau produit", currentValue: 50, previousValue: 0 }]);
    expect(result).toHaveLength(0);
  });

  it("traite plusieurs métriques indépendamment dans un même appel", () => {
    const result = detectPlatformAnomalies([
      { name: "Revenu", currentValue: 10000, previousValue: 10000 }, // stable
      { name: "Séances", currentValue: 50, previousValue: 100 }, // -50%, anomalie
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.metric).toBe("Séances");
  });

  it("retourne un tableau vide pour une liste de métriques vide", () => {
    expect(detectPlatformAnomalies([])).toEqual([]);
  });
});
