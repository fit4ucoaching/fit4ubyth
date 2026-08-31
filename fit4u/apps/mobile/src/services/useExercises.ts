import { queryKeys } from "@fit4u/api-client";
import type { ExerciseDTO } from "@fit4u/types";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function useExercises(filters: { categoryId?: string; muscleGroupId?: string; difficultyLevel?: string }) {
  return useInfiniteQuery({
    queryKey: queryKeys.exercises.list(filters),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), pageSize: "20", ...filters } as Record<string, string>);
      return apiClient.get<PaginatedResult<ExerciseDTO>>(`/exercises?${params.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
  });
}

export function useExerciseSearch(query: string) {
  return useQuery({
    queryKey: ["exercises", "search", query],
    queryFn: () => apiClient.get<PaginatedResult<ExerciseDTO>>(`/exercises/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(id),
    queryFn: () => apiClient.get<ExerciseDTO>(`/exercises/${id}`),
    enabled: Boolean(id),
  });
}

export function useToggleFavoriteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) =>
      apiClient.post<{ isFavorite: boolean }>("/exercises/favorite", { exerciseId }),
    onSuccess: (_data, exerciseId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.exercises.detail(exerciseId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.exercises.favorites });
    },
  });
}

export function useFavoriteExercises() {
  return useQuery({
    queryKey: queryKeys.exercises.favorites,
    queryFn: () => apiClient.get<{ exercise: ExerciseDTO }[]>("/exercises/favorites"),
  });
}
