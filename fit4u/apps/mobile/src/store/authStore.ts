import type { UserDTO } from "@fit4u/types";
import { create } from "zustand";

/**
 * État d'authentification CLIENT uniquement (Volume 4) — les tokens
 * eux-mêmes vivent dans `expo-secure-store` via l'adaptateur
 * `services/tokenStorage.ts` (jamais dans Zustand, jamais en clair en
 * mémoire persistée). Ce store ne fait que refléter "suis-je connecté ?"
 * et un snapshot synchronisé du profil courant pour un accès instantané
 * dans toute l'app (header, guards de navigation) sans attendre React Query.
 */
interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  /** true tant que la vérification initiale des tokens stockés n'est pas terminée. */
  isHydrating: boolean;
  setUser: (user: UserDTO | null) => void;
  setHydrated: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setHydrated: () => set({ isHydrating: false }),
  signOut: () => set({ user: null, isAuthenticated: false }),
}));
