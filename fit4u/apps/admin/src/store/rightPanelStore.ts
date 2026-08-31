import { create } from "zustand";

/** RightPanel optionnel (Volume 6) — contenu contextuel (détail rapide, aide) sans quitter la page courante. */
interface RightPanelState {
  isOpen: boolean;
  title: string | null;
  content: React.ReactNode | null;
  open: (title: string, content: React.ReactNode) => void;
  close: () => void;
}

export const useRightPanelStore = create<RightPanelState>((set) => ({
  isOpen: false,
  title: null,
  content: null,
  open: (title, content) => set({ isOpen: true, title, content }),
  close: () => set({ isOpen: false, title: null, content: null }),
}));
