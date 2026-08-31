import type { UserDTO } from "@fit4u/types";
import { create } from "zustand";

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setUser: (user: UserDTO | null) => void;
  setHydrated: () => void;
  signOut: () => void;
}

/** Store auth admin — identique en forme au web/mobile ; l'accès est en plus filtré par rôle (voir RequireAdminRole). */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setHydrated: () => set({ isHydrating: false }),
  signOut: () => set({ user: null, isAuthenticated: false }),
}));
