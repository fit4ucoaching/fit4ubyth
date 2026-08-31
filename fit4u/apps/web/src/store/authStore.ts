import type { UserDTO } from "@fit4u/types";
import { create } from "zustand";

/** Miroir du store mobile (Volume 4) — mêmes responsabilités, adaptateur de stockage différent. */
interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
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
