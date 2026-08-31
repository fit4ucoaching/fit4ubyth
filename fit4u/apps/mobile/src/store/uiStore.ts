import { create } from "zustand";

export interface Toast {
  id: string;
  variant: "success" | "error" | "info" | "warning";
  message: string;
}

export type DashboardWidgetId =
  | "todaySession" | "goal" | "calories" | "hydration" | "steps" | "sleep"
  | "weight" | "xp" | "streak" | "challenges" | "teddy" | "shop" | "community";

const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  "todaySession", "teddy", "goal", "streak", "xp", "calories",
  "hydration", "weight", "challenges", "steps", "sleep", "community", "shop",
];

/**
 * État UI transverse — toasts, feuilles/modales globales, statut réseau
 * (Volume 4 : mode offline), et ordre des widgets du Dashboard
 * personnalisable (persisté par l'app via `services/dashboardLayout.ts`).
 */
interface UiState {
  toasts: Toast[];
  isOffline: boolean;
  dashboardWidgetOrder: DashboardWidgetId[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  setOffline: (isOffline: boolean) => void;
  reorderDashboardWidgets: (order: DashboardWidgetId[]) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  isOffline: false,
  dashboardWidgetOrder: DEFAULT_WIDGET_ORDER,
  pushToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setOffline: (isOffline) => set({ isOffline }),
  reorderDashboardWidgets: (dashboardWidgetOrder) => set({ dashboardWidgetOrder }),
}));
