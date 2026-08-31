import { describe, expect, it } from "vitest";

import { formatMemoryForPrompt } from "../src/memory/formatMemory";
import type { TeddyFullMemory } from "../src/memory/types";

/** Memory tests (Volume 5) — vérifie le formatage de la mémoire à 3 niveaux pour le prompt. */
describe("formatMemoryForPrompt", () => {
  const baseMemory: TeddyFullMemory = {
    permanent: {
      firstName: "Alex",
      locale: "fr",
      goals: [{ type: "WEIGHT_LOSS", title: "Perdre 5kg" }],
      availableEquipment: ["DUMBBELLS"],
      dietaryPreferences: [],
      declaredInjuries: [],
    },
    evolutive: {
      currentWeightKg: 78,
      latestMeasurements: [],
      recentPerformances: [],
      favoriteExerciseNames: [],
      replacedExerciseNames: [],
      usualWorkoutHours: [],
      weeklyFrequency: 3,
      likedRecipeNames: [],
      completedChallengeTitles: [],
    },
    conversational: { recentMessages: [] },
  };

  it("inclut le prénom et les objectifs", () => {
    const result = formatMemoryForPrompt(baseMemory);
    expect(result).toContain("Alex");
    expect(result).toContain("Perdre 5kg");
  });

  it("met en avant les blessures déclarées avec une alerte visuelle", () => {
    const memoryWithInjury: TeddyFullMemory = {
      ...baseMemory,
      permanent: { ...baseMemory.permanent, declaredInjuries: ["genou droit"] },
    };
    const result = formatMemoryForPrompt(memoryWithInjury);
    expect(result).toContain("⚠️");
    expect(result).toContain("genou droit");
  });

  it("n'affiche aucun objectif si la liste est vide", () => {
    const emptyGoals: TeddyFullMemory = { ...baseMemory, permanent: { ...baseMemory.permanent, goals: [] } };
    const result = formatMemoryForPrompt(emptyGoals);
    expect(result).toContain("Aucun objectif défini");
  });

  it("inclut le résumé intelligent quand disponible", () => {
    const withSummary: TeddyFullMemory = {
      ...baseMemory,
      conversational: { recentMessages: [], intelligentSummary: "S'entraîne le soir, préfère les haltères." },
    };
    const result = formatMemoryForPrompt(withSummary);
    expect(result).toContain("S'entraîne le soir");
  });

  it("omet la section résumé si absente (pas de section vide)", () => {
    const result = formatMemoryForPrompt(baseMemory);
    expect(result).not.toContain("## Résumé des échanges précédents");
  });
});
