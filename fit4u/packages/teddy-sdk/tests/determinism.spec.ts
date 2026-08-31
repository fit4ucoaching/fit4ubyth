import { describe, expect, it } from "vitest";

import { computeAdaptation } from "../src/coach/adaptation";
import { calculateMacroTargets } from "../src/nutrition/calculations";
import { decideRecovery } from "../src/recovery/teddyRecovery";
import { computeMotivationTone } from "../src/motivation/teddyMotivation";
import { detectTrend } from "../src/analytics/teddyAnalytics";

/**
 * Tests de régression sur la logique déterministe (Volume 5 : "Tous les
 * workflows doivent être déterministes"). Ces fonctions ne doivent JAMAIS
 * produire un résultat différent pour la même entrée — toute modification
 * qui casse un de ces tests est un changement de comportement à valider
 * explicitement, jamais une régression silencieuse.
 */
describe("Régression — logique déterministe", () => {
  it("computeAdaptation : repos complet en cas de statut 'rest'", () => {
    const result = computeAdaptation({
      goalType: "MUSCLE_GAIN", fitnessLevel: "INTERMEDIATE", availableEquipment: [],
      sessionsPerWeek: 4, durationWeeks: 8, recoveryStatus: "rest", recentExerciseNames: [],
    });
    expect(result.volumeMultiplier).toBe(0);
    expect(result.intensityMultiplier).toBe(0);
  });

  it("computeAdaptation : séance standard sans signal de fatigue", () => {
    const result = computeAdaptation({
      goalType: "MUSCLE_GAIN", fitnessLevel: "INTERMEDIATE", availableEquipment: [],
      sessionsPerWeek: 4, durationWeeks: 8, recentExerciseNames: [],
    });
    expect(result.volumeMultiplier).toBe(1);
  });

  it("calculateMacroTargets : résultat identique pour la même entrée (déterminisme strict)", () => {
    const input = {
      weightKg: 75, heightCm: 178, age: 30, gender: "MALE" as const,
      activityLevel: "moderate" as const, goalType: "WEIGHT_LOSS",
    };
    expect(calculateMacroTargets(input)).toEqual(calculateMacroTargets(input));
  });

  it("calculateMacroTargets : réduit les calories pour un objectif de perte de poids", () => {
    const base = { weightKg: 75, heightCm: 178, age: 30, gender: "MALE" as const, activityLevel: "moderate" as const };
    const maintenance = calculateMacroTargets({ ...base, goalType: "MAINTENANCE" });
    const weightLoss = calculateMacroTargets({ ...base, goalType: "WEIGHT_LOSS" });
    expect(weightLoss.dailyCalories).toBeLessThan(maintenance.dailyCalories);
  });

  it("decideRecovery : repos forcé après fatigue déclarée maximale", () => {
    const result = decideRecovery({ recentSessionsCount: 2, daysSinceLastRest: 1, selfReportedFatigue: 5 });
    expect(result.decision).toBe("rest");
  });

  it("computeMotivationTone : encouragements fréquents pour un débutant", () => {
    const tone = computeMotivationTone({ fitnessLevel: "BEGINNER", daysSinceLastActivity: 0, adherenceRate: 0.8 });
    expect(tone).toBe("frequent_encouragement");
  });

  it("computeMotivationTone : célébration prioritaire sur tout autre signal", () => {
    const tone = computeMotivationTone({
      fitnessLevel: "ADVANCED", daysSinceLastActivity: 10, adherenceRate: 0.1, justAchievedGoal: true,
    });
    expect(tone).toBe("celebratory");
  });

  it("detectTrend : premier rapport si aucune comparaison disponible", () => {
    const trend = detectTrend({
      period: "weekly", workoutsCompleted: 3, totalCaloriesBurned: 1200,
      personalRecordsCount: 0, adherenceRate: 0.6,
    });
    expect(trend).toBe("premier_rapport");
  });
});
