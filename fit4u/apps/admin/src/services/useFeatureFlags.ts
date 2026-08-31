import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface FeatureFlagRow {
  id: string;
  key: string;
  description: string | null;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetAudience: "ALL" | "PREMIUM" | "VIP" | "BETA";
  targetCountries: string[];
  targetMinVersion: string | null;
  isBeta: boolean;
}

export function useFeatureFlagsList() {
  return useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: () => apiClient.get<FeatureFlagRow[]>("/admin/feature-flags"),
  });
}

export function useUpsertFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<FeatureFlagRow, "id">) => apiClient.put<FeatureFlagRow>("/admin/feature-flags", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}
