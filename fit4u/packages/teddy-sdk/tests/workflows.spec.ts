import { describe, expect, it } from "vitest";

import { findWorkflow, WORKFLOW_REGISTRY } from "../src/workflows/registry";
import { LOSE_WEIGHT_WORKFLOW } from "../src/workflows/loseWeightWorkflow";

/**
 * Workflow tests (Volume 5) — vérifie que la séquence d'étapes reste
 * déterministe et complète. Si ce test échoue après une modification de
 * `loseWeightWorkflow.ts`, c'est le signal qu'une étape a été
 * accidentellement supprimée ou réordonnée.
 */
describe("LOSE_WEIGHT_WORKFLOW", () => {
  it("suit exactement la séquence décrite au Master Prompt Volume 5", () => {
    const stepNames = LOSE_WEIGHT_WORKFLOW.steps.map((s) => s.name);
    expect(stepNames).toEqual([
      "analyze_profile", "calculate_calories", "create_goal", "generate_workout",
      "generate_meal_plan", "create_challenge", "plan_week", "respond",
    ]);
  });

  it("associe un outil du registre à chaque étape qui en nécessite un", () => {
    const toolNames = LOSE_WEIGHT_WORKFLOW.steps.filter((s) => s.toolName).map((s) => s.toolName);
    expect(toolNames).toEqual(["CalculateCalories", "GenerateWorkout", "GenerateMealPlan", "CreateChallenge"]);
  });

  it("se termine toujours par une étape de réponse finale", () => {
    const lastStep = LOSE_WEIGHT_WORKFLOW.steps.at(-1);
    expect(lastStep?.name).toBe("respond");
  });
});

describe("registry", () => {
  it("retrouve un workflow existant par id", () => {
    expect(findWorkflow("lose_weight")?.id).toBe("lose_weight");
  });

  it("renvoie undefined pour un workflow inconnu", () => {
    expect(findWorkflow("workflow_inexistant")).toBeUndefined();
  });

  it("chaque workflow du registre a au moins une étape", () => {
    for (const workflow of WORKFLOW_REGISTRY) {
      expect(workflow.steps.length).toBeGreaterThan(0);
    }
  });
});
