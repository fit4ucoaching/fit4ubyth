import type { TokenStorage } from "@fit4u/api-client";

const ACCESS_TOKEN_KEY = "fit4u_admin_access_token";
const REFRESH_TOKEN_KEY = "fit4u_admin_refresh_token";

/** Espace de stockage distinct de `apps/web` (clés préfixées `_admin_`) — sessions jamais partagées entre les deux apps. */
export const adminTokenStorage: TokenStorage = {
  async getAccessToken() { return localStorage.getItem(ACCESS_TOKEN_KEY); },
  async getRefreshToken() { return localStorage.getItem(REFRESH_TOKEN_KEY); },
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
