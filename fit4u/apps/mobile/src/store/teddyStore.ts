import type { TeddyMessage, TeddySuggestedAction } from "@fit4u/teddy-sdk";
import { create } from "zustand";

/**
 * État UI de la conversation Teddy active — permet à la bulle flottante
 * Teddy (présente sur Dashboard/séance/nutrition/rapports, Volume 4) de
 * partager le même fil sans re-fetch, tout en laissant React Query gérer la
 * persistance réelle des messages (`services/useTeddy.ts`).
 */
interface TeddyState {
  conversationId: string | null;
  messages: TeddyMessage[];
  isTyping: boolean;
  suggestedActions: TeddySuggestedAction[];
  isBubbleExpanded: boolean;
  setConversationId: (id: string | null) => void;
  addMessage: (message: TeddyMessage) => void;
  setMessages: (messages: TeddyMessage[]) => void;
  setTyping: (isTyping: boolean) => void;
  setSuggestedActions: (actions: TeddySuggestedAction[]) => void;
  toggleBubble: (expanded?: boolean) => void;
  reset: () => void;
}

export const useTeddyStore = create<TeddyState>((set) => ({
  conversationId: null,
  messages: [],
  isTyping: false,
  suggestedActions: [],
  isBubbleExpanded: false,
  setConversationId: (conversationId) => set({ conversationId }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setTyping: (isTyping) => set({ isTyping }),
  setSuggestedActions: (suggestedActions) => set({ suggestedActions }),
  toggleBubble: (expanded) => set((s) => ({ isBubbleExpanded: expanded ?? !s.isBubbleExpanded })),
  reset: () => set({ conversationId: null, messages: [], isTyping: false, suggestedActions: [] }),
}));
