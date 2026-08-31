import { queryKeys } from "@fit4u/api-client";
import type { FoodDTO, FoodPhotoAnalysisDTO, RecipeDTO, WaterLogResultDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNutritionStore } from "../store/nutritionStore";
import { apiClient } from "./apiClient";

export function useFoods(filters: { categoryId?: string; q?: string }) {
  return useQuery({
    queryKey: queryKeys.nutrition.foods(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      return apiClient.get<{ items: FoodDTO[]; total: number }>(`/foods?${params.toString()}`);
    },
  });
}

export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.nutrition.recipes,
    queryFn: () => apiClient.get<{ items: RecipeDTO[]; total: number }>("/recipes"),
  });
}

export function useGenerateMealPlan() {
  return useMutation({
    mutationFn: (input: {
      startDate: string;
      dailyCalorieTarget?: number;
      dietaryPreferences: string[];
      mealsPerDay: number;
    }) => apiClient.post<{ aiNutritionPlanId: string }>("/meal-plans/generate", input),
  });
}

export function useLogWater() {
  const setTodayWaterMl = useNutritionStore((s) => s.setTodayWaterMl);
  return useMutation({
    mutationFn: (amountMl: number) => apiClient.post<WaterLogResultDTO>("/nutrition/water", { amountMl }),
    onSuccess: (result) => setTodayWaterMl(result.todayTotalMl),
  });
}

export function useScanBarcode() {
  return useMutation({
    mutationFn: (barcode: string) => apiClient.post<FoodDTO>("/nutrition/barcode", { barcode }),
  });
}

export function useAnalyzeFoodPhoto() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload<FoodPhotoAnalysisDTO>("/nutrition/analyze-photo", formData),
  });
}
