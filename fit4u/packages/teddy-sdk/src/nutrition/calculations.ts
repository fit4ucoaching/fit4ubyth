/**
 * Calculs nutritionnels déterministes (Volume 5 : "Calculer calories,
 * protéines, glucides, lipides, hydratation"). Formules standard
 * (Mifflin-St Jeor pour le métabolisme de base) — jamais déléguées au LLM,
 * qui ne doit ni halluciner ni arrondir différemment d'un appel à l'autre.
 */
export interface CalorieCalculationInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goalType: string;
}

const ACTIVITY_MULTIPLIERS: Record<CalorieCalculationInput["activityLevel"], number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  WEIGHT_LOSS: -0.2, MUSCLE_GAIN: 0.1, MAINTENANCE: 0, PERFORMANCE: 0.05, ENDURANCE: 0.05,
};

export interface MacroTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterMl: number;
}

/** Mifflin-St Jeor — référence standard, précise à ±10% pour la population générale. */
export function calculateMacroTargets(input: CalorieCalculationInput): MacroTargets {
  const bmr =
    input.gender === "FEMALE"
      ? 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 161
      : 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + 5;

  const maintenanceCalories = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const adjustment = GOAL_ADJUSTMENTS[input.goalType] ?? 0;
  const dailyCalories = Math.round(maintenanceCalories * (1 + adjustment));

  const proteinRatio = 0.3;
  const fatRatio = 0.3;
  const carbsRatio = 1 - proteinRatio - fatRatio;

  return {
    dailyCalories,
    proteinGrams: Math.round((dailyCalories * proteinRatio) / 4),
    carbsGrams: Math.round((dailyCalories * carbsRatio) / 4),
    fatGrams: Math.round((dailyCalories * fatRatio) / 9),
    waterMl: Math.round(input.weightKg * 35),
  };
}
