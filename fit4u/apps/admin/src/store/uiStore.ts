import { create } from "zustand";

export interface Toast {
  id: string;
  variant: "success" | "error" | "info" | "warning";
  message: string;
}

/** État UI transverse admin (Volume 6) — inclut le RightPanel optionnel du layout. */
interface UiState {
  toasts: Toast[];
  rightPanelContent: { title: string; content: React.ReactNode } | null;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  openRightPanel: (panel: { title: string; content: React.ReactNode }) => void;
  closeRightPanel: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  rightPanelContent: null,
  pushToast: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  openRightPanel: (panel) => set({ rightPanelContent: panel }),
  closeRightPanel: () => set({ rightPanelContent: null }),
}));
