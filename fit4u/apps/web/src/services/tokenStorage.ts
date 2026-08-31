import type { TokenStorage } from "@fit4u/api-client";

/**
 * Adaptateur `TokenStorage` pour le web — localStorage (Volume 4). Un choix
 * de production plus strict (cookie httpOnly + refresh via endpoint dédié
 * pour échapper au XSS) est documenté comme évolution possible ; localStorage
 * reste cohérent avec le reste du monorepo qui n'a pas encore de couche BFF
 * dédiée à la gestion de cookies sécurisés.
 */
const ACCESS_TOKEN_KEY = "fit4u_access_token";
const REFRESH_TOKEN_KEY = "fit4u_refresh_token";

export const webTokenStorage: TokenStorage = {
  async getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export function hasStoredSession(): boolean {
  return localStorage.getItem(REFRESH_TOKEN_KEY) !== null;
}
