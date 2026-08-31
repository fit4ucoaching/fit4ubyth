import { create } from "zustand";

/** État de composition/filtrage communauté — le flux lui-même reste en cache React Query. */
interface CommunityState {
  draftPostContent: string;
  draftPostImageUri: string | null;
  activeGroupId: string | null;
  setDraftPostContent: (content: string) => void;
  setDraftPostImageUri: (uri: string | null) => void;
  clearDraft: () => void;
  setActiveGroupId: (groupId: string | null) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  draftPostContent: "",
  draftPostImageUri: null,
  activeGroupId: null,
  setDraftPostContent: (draftPostContent) => set({ draftPostContent }),
  setDraftPostImageUri: (draftPostImageUri) => set({ draftPostImageUri }),
  clearDraft: () => set({ draftPostContent: "", draftPostImageUri: null }),
  setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
}));
