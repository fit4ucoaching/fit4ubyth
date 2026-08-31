import { queryKeys } from "@fit4u/api-client";
import type { AuthResult, LoginPayload, RegisterPayload, UserDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../store/authStore";
import { apiClient } from "./apiClient";
import { webTokenStorage } from "./tokenStorage";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: LoginPayload) => apiClient.post<AuthResult>("/auth/login", payload, { skipAuth: true }),
    onSuccess: async (result) => {
      await webTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => apiClient.post<AuthResult>("/auth/register", payload, { skipAuth: true }),
    onSuccess: async (result) => {
      await webTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await webTokenStorage.getRefreshToken();
      if (refreshToken) await apiClient.post("/auth/logout", { refreshToken }).catch(() => undefined);
    },
    onSettled: async () => {
      await webTokenStorage.clearTokens();
      signOut();
      queryClient.clear();
    },
  });
}

export function useCurrentUser(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const user = await apiClient.get<UserDTO>("/auth/me");
      setUser(user);
      return user;
    },
    enabled,
    retry: false,
  });
}
