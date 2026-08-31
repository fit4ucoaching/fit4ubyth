import { queryKeys } from "@fit4u/api-client";
import type { ProfileDTO, UserDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUserStore } from "../store/userStore";
import { apiClient } from "./apiClient";

export function useMe(enabled = true) {
  const setProfile = useUserStore((s) => s.setProfile);

  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: async () => {
      const result = await apiClient.get<{ profile: ProfileDTO } & UserDTO>("/users/me");
      setProfile(result.profile);
      return result;
    },
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProfileDTO> & { locale?: string }) => apiClient.put("/users/me", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: () => apiClient.delete("/users/me") });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => apiClient.upload<{ avatarUrl: string }>("/users/avatar", formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useUserStatistics() {
  return useQuery({
    queryKey: queryKeys.users.statistics,
    queryFn: () => apiClient.get("/users/statistics"),
  });
}
