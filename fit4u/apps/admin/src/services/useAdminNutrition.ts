import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface FoodCategoryRow { id: string; name: string; slug: string }

export interface FoodRow {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  category: FoodCategoryRow;
}

export interface RecipeRow {
  id: string;
  name: string;
  servings: number;
  prepTimeMinutes: number | null;
  isPremium: boolean;
  ingredients: { food: { name: string }; quantityGrams: string }[];
}

export function useFoodCategories() {
  return useQuery({ queryKey: ["admin", "nutrition", "categories"], queryFn: () => apiClient.get<FoodCategoryRow[]>("/admin/nutrition/categories") });
}

export function useFoodsList(params: { page: number; pageSize: number; q?: string }) {
  return useQuery({
    queryKey: ["admin", "nutrition", "foods", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.q ? { q: params.q } : {}) });
      return apiClient.get<{ items: FoodRow[]; total: number }>(`/admin/nutrition/foods?${query.toString()}`);
    },
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { categoryId: string; name: string; caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }) =>
      apiClient.post<FoodRow>("/admin/nutrition/foods", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "nutrition", "foods"] }),
  });
}

export function useArchiveFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/nutrition/foods/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "nutrition", "foods"] }),
  });
}

export function useRecipesList(params: { page: number; pageSize: number; q?: string }) {
  return useQuery({
    queryKey: ["admin", "nutrition", "recipes", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.q ? { q: params.q } : {}) });
      return apiClient.get<{ items: RecipeRow[]; total: number }>(`/admin/nutrition/recipes?${query.toString()}`);
    },
  });
}

export function useArchiveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/nutrition/recipes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "nutrition", "recipes"] }),
  });
}
