import { createHttpClient } from "@fit4u/api-client";

import { useAuthStore } from "../store/authStore";
import { secureTokenStorage } from "./tokenStorage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/**
 * Instance unique du client API mobile — seul point d'accès réseau
 * (Volume 4 : "Aucun fetch direct dans les composants"). Consommée
 * exclusivement par les hooks React Query de `services/use*.ts`.
 */
export const apiClient = createHttpClient({
  baseUrl: API_BASE_URL,
  tokenStorage: secureTokenStorage,
  onSessionExpired: () => {
    useAuthStore.getState().signOut();
  },
});
