import { create } from "zustand";

export interface Toast {
  id: string;
  variant: "success" | "error" | "info" | "warning";
  message: string;
}

interface UiState {
  toasts: Toast[];
  isSidebarCollapsed: boolean;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  isSidebarCollapsed: false,
  pushToast: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}));
