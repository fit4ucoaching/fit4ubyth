import { queryKeys } from "@fit4u/api-client";
import type { ProgramDetailDTO, ProgramSummaryDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function usePrograms(filters: { goalType?: string; difficultyLevel?: string }) {
  return useQuery({
    queryKey: queryKeys.programs.list(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      return apiClient.get<{ items: ProgramSummaryDTO[]; total: number }>(`/programs?${params.toString()}`);
    },
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: queryKeys.programs.detail(id),
    queryFn: () => apiClient.get<ProgramDetailDTO>(`/programs/${id}`),
    enabled: Boolean(id),
  });
}

export function useGenerateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      goalType: string;
      difficultyLevel: string;
      durationWeeks: number;
      sessionsPerWeek: number;
      availableEquipment: string[];
    }) => apiClient.post<{ aiWorkoutPlanId: string }>("/programs/generate", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
}
