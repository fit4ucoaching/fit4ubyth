import { queryKeys } from "@fit4u/api-client";
import type { AuthResult, LoginPayload, RegisterPayload, UserDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../store/authStore";
import { apiClient } from "./apiClient";
import { secureTokenStorage } from "./tokenStorage";

/**
 * Hook public du domaine Auth — seul point d'entrée utilisé par les écrans
 * (Volume 4). Toute mutation qui obtient des tokens les persiste via
 * `secureTokenStorage` puis synchronise `authStore` pour un accès
 * synchrone immédiat (garde de navigation, header).
 */
export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiClient.post<AuthResult>("/auth/login", payload, { skipAuth: true }),
    onSuccess: async (result) => {
      await secureTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiClient.post<AuthResult>("/auth/register", payload, { skipAuth: true }),
    onSuccess: async (result) => {
      await secureTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await secureTokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken }).catch(() => undefined);
      }
    },
    onSettled: async () => {
      await secureTokenStorage.clearTokens();
      signOut();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<{ message: string }>("/auth/forgot-password", { email }, { skipAuth: true }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      apiClient.post<{ message: string }>("/auth/reset-password", input, { skipAuth: true }),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.post<{ message: string }>("/auth/verify-email", { token }, { skipAuth: true }),
  });
}

export function useGoogleAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (idToken: string) =>
      apiClient.post<AuthResult>("/auth/google", { idToken }, { skipAuth: true }),
    onSuccess: async (result) => {
      await secureTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

export function useAppleAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: { identityToken: string; firstName?: string; lastName?: string }) =>
      apiClient.post<AuthResult>("/auth/apple", input, { skipAuth: true }),
    onSuccess: async (result) => {
      await secureTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

/** Vérifie la session au démarrage (voir `app/AppProviders.tsx`) — hydrate `authStore`. */
export function useCurrentUser(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const user = await apiClient.get<UserDTO & { roles: string[] }>("/auth/me");
      setUser(user as UserDTO);
      return user;
    },
    enabled,
    retry: false,
  });
}
