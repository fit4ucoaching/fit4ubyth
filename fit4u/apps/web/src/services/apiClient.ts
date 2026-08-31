import { createHttpClient } from "@fit4u/api-client";

import { useAuthStore } from "../store/authStore";
import { webTokenStorage } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient = createHttpClient({
  baseUrl: API_BASE_URL,
  tokenStorage: webTokenStorage,
  onSessionExpired: () => useAuthStore.getState().signOut(),
});
