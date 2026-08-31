import { describe, expect, it } from "vitest";

import { findToolDefinition, TOOL_DEFINITIONS, toOpenAIToolsFormat } from "../src/tools/toolRegistry";

/** Tool tests (Volume 5) — vérifie l'intégrité du registre des 12 outils internes. */
describe("toolRegistry", () => {
  it("expose exactement les 12 outils listés au Master Prompt Volume 5", () => {
    const expectedNames = [
      "GenerateWorkout", "GenerateMealPlan", "CalculateCalories", "SearchExercises",
      "GetUserHistory", "GetProgress", "SaveWeight", "SaveWorkout", "CreateChallenge",
      "SearchRecipes", "GetNutritionGoals", "GetShoppingList",
    ];
    expect(TOOL_DEFINITIONS.map((t) => t.name).sort()).toEqual(expectedNames.sort());
  });

  it("chaque outil a une description non vide", () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });

  it("chaque outil a un schéma de paramètres de type object valide", () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.parameters.type).toBe("object");
      expect(Array.isArray(tool.parameters.required)).toBe(true);
    }
  });

  it("findToolDefinition retrouve un outil existant par nom", () => {
    expect(findToolDefinition("GenerateWorkout")?.name).toBe("GenerateWorkout");
  });

  it("findToolDefinition renvoie undefined pour un outil inconnu", () => {
    expect(findToolDefinition("OutilInexistant")).toBeUndefined();
  });

  it("toOpenAIToolsFormat produit le format function-calling attendu", () => {
    const formatted = toOpenAIToolsFormat();
    expect(formatted).toHaveLength(TOOL_DEFINITIONS.length);
    expect(formatted[0]).toMatchObject({ type: "function" });
    expect(formatted[0]!.function.name).toBeTruthy();
  });
});
