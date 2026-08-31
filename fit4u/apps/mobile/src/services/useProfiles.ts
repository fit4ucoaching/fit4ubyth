import { queryKeys } from "@fit4u/api-client";
import type { PrivacySettingsDTO, UserPreferencesDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUserStore } from "../store/userStore";
import { apiClient } from "./apiClient";

export function usePreferences() {
  const setPreferences = useUserStore((s) => s.setPreferences);
  return useQuery({
    queryKey: queryKeys.profiles.preferences,
    queryFn: async () => {
      const data = await apiClient.get<UserPreferencesDTO>("/profiles/me/preferences");
      setPreferences(data);
      return data;
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserPreferencesDTO>) => apiClient.put("/profiles/me/preferences", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles.preferences }),
  });
}

export function usePrivacy() {
  const setPrivacy = useUserStore((s) => s.setPrivacy);
  return useQuery({
    queryKey: queryKeys.profiles.privacy,
    queryFn: async () => {
      const data = await apiClient.get<PrivacySettingsDTO>("/profiles/me/privacy");
      setPrivacy(data);
      return data;
    },
  });
}

export function useUpdatePrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PrivacySettingsDTO>) => apiClient.put("/profiles/me/privacy", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles.privacy }),
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: "PUSH" | "EMAIL" | "IN_APP"; isEnabled: boolean }) =>
      apiClient.put("/profiles/me/notifications", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles.notifications }),
  });
}
