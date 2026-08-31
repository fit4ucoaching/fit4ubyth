import type { AuthResult, LoginPayload, UserDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../store/authStore";
import { apiClient } from "./apiClient";
import { adminTokenStorage } from "./tokenStorage";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: LoginPayload) => apiClient.post<AuthResult>("/auth/login", payload, { skipAuth: true }),
    onSuccess: async (result) => {
      // Le contrôle d'accès réel (rôle ADMIN/SUPER_ADMIN) est appliqué par
      // chaque route `/admin/*` côté backend (Volume 3) — la vérification
      // ici n'est qu'un confort UX pour rediriger immédiatement les
      // comptes non-admin, jamais une garantie de sécurité côté client.
      await adminTokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await adminTokenStorage.getRefreshToken();
      if (refreshToken) await apiClient.post("/auth/logout", { refreshToken }).catch(() => undefined);
    },
    onSettled: async () => {
      await adminTokenStorage.clearTokens();
      signOut();
      queryClient.clear();
    },
  });
}

export function useCurrentUser(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await apiClient.get<UserDTO>("/auth/me");
      setUser(user);
      return user;
    },
    enabled,
    retry: false,
  });
}
