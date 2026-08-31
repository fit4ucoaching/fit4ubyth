export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface FoodDTO {
  id: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  barcode?: string;
}

export interface RecipeDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  prepTimeMinutes?: number;
  servings: number;
  imageUrl?: string;
  isPremium: boolean;
}

export interface MealPlanDTO {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  dailyCalorieTarget?: number;
}

export interface WaterLogResultDTO {
  todayTotalMl: number;
}

export interface FoodPhotoAnalysisDTO {
  identifiedFoods: { name: string; estimatedGrams: number }[];
  estimatedCalories: number;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
  confidence: "low" | "medium" | "high";
}
