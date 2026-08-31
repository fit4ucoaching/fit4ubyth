import { create } from "zustand";

/**
 * État UI propre au BackOffice (Volume 4) — sélection multi-lignes pour
 * "Actions en masse", filtres de table actifs. Les données elles-mêmes
 * (utilisateurs, commandes…) restent en cache React Query, jamais dupliquées ici.
 */
interface AdminState {
  selectedRowIds: string[];
  activeFilters: Record<string, string>;
  toggleRowSelection: (id: string) => void;
  clearSelection: () => void;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedRowIds: [],
  activeFilters: {},
  toggleRowSelection: (id) =>
    set((s) => ({
      selectedRowIds: s.selectedRowIds.includes(id)
        ? s.selectedRowIds.filter((rowId) => rowId !== id)
        : [...s.selectedRowIds, id],
    })),
  clearSelection: () => set({ selectedRowIds: [] }),
  setFilter: (key, value) => set((s) => ({ activeFilters: { ...s.activeFilters, [key]: value } })),
  clearFilters: () => set({ activeFilters: {} }),
}));
