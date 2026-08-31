import type { TokenStorage } from "@fit4u/api-client";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "fit4u_access_token";
const REFRESH_TOKEN_KEY = "fit4u_refresh_token";

/** Adaptateur `TokenStorage` pour mobile — chiffré via Expo SecureStore (Keychain/Keystore). */
export const secureTokenStorage: TokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken, refreshToken) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

export async function hasStoredSession(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  return token !== null;
}
