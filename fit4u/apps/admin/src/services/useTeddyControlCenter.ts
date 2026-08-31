import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export type PromptKey = "COACH" | "NUTRITION" | "RECOVERY" | "MOTIVATION" | "ANALYTICS" | "PLANNER";

export interface PromptVersionRow {
  id: string;
  key: PromptKey;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  creator: { email: string };
}

export function usePromptHistory(key: PromptKey) {
  return useQuery({
    queryKey: ["admin", "teddy", "prompts", key],
    queryFn: () => apiClient.get<PromptVersionRow[]>(`/admin/teddy/prompts/${key}/history`),
  });
}

export function useCreatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { key: PromptKey; content: string }) => apiClient.post<PromptVersionRow>("/admin/teddy/prompts", input),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ["admin", "teddy", "prompts", variables.key] }),
  });
}

export function useActivatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/teddy/prompts/${id}/activate`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "teddy", "prompts"] }),
  });
}

export function useDeactivatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/teddy/prompts/${id}/deactivate`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "teddy", "prompts"] }),
  });
}

export function usePreviewPrompt() {
  return useMutation({
    mutationFn: (input: { content: string; sampleMessage: string }) => apiClient.post<{ response: string }>("/admin/teddy/prompts/preview", input),
  });
}
