import { describe, expect, it } from "vitest";

import { computeMonthlyRecurringRevenueCents } from "../mrrCalculation";

/**
 * Tests du calcul MRR réel (corrigé après revue continue — l'ancienne
 * version sommait des paiements Boutique, jamais des abonnements
 * digitaux). Normalisation mensuelle des abonnements annuels : Volume 7 §21
 * appliqué (unités mineures, arrondi explicite plutôt qu'un float implicite).
 */
describe("computeMonthlyRecurringRevenueCents", () => {
  it("somme directement les abonnements mensuels", () => {
    const result = computeMonthlyRecurringRevenueCents([
      { price: { amountCents: 999, billingInterval: "MONTH" } },
      { price: { amountCents: 1999, billingInterval: "MONTH" } },
    ]);
    expect(result).toBe(2998);
  });

  it("normalise un abonnement annuel en équivalent mensuel (÷12, arrondi)", () => {
    const result = computeMonthlyRecurringRevenueCents([{ price: { amountCents: 12000, billingInterval: "YEAR" } }]);
    expect(result).toBe(1000); // 12000 / 12 = 1000, exact
  });

  it("arrondit un abonnement annuel qui ne se divise pas exactement par 12", () => {
    const result = computeMonthlyRecurringRevenueCents([{ price: { amountCents: 10000, billingInterval: "YEAR" } }]);
    expect(result).toBe(Math.round(10000 / 12)); // 833
  });

  it("exclut un abonnement sans prix lié plutôt que de fausser le total", () => {
    const result = computeMonthlyRecurringRevenueCents([
      { price: { amountCents: 999, billingInterval: "MONTH" } },
      { price: null },
    ]);
    expect(result).toBe(999);
  });

  it("mélange mensuel et annuel correctement dans un même calcul", () => {
    const result = computeMonthlyRecurringRevenueCents([
      { price: { amountCents: 999, billingInterval: "MONTH" } },
      { price: { amountCents: 9999, billingInterval: "YEAR" } },
    ]);
    expect(result).toBe(999 + Math.round(9999 / 12));
  });

  it("retourne 0 pour une liste vide", () => {
    expect(computeMonthlyRecurringRevenueCents([])).toBe(0);
  });
});
