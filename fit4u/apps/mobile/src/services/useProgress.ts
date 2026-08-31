import { queryKeys } from "@fit4u/api-client";
import type { ProgressAnalyticsDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function useLogWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { weightKg: number; recordedAt?: string }) => apiClient.post("/progress/weight", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.history });
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.analytics });
    },
  });
}

export function useLogMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bodyPart: string; valueCm: number }) => apiClient.post("/progress/measurements", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.progress.history }),
  });
}

export function useLogProgressPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => apiClient.upload("/progress/photo", formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.progress.history }),
  });
}

export function useProgressHistory() {
  return useQuery({
    queryKey: queryKeys.progress.history,
    queryFn: () => apiClient.get("/progress/history"),
  });
}

export function useProgressAnalytics() {
  return useQuery({
    queryKey: queryKeys.progress.analytics,
    queryFn: () => apiClient.get<ProgressAnalyticsDTO>("/progress/analytics"),
  });
}
