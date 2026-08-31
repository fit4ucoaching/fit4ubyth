import type { TeddyReply } from "@fit4u/teddy-sdk";
import { useMutation } from "@tanstack/react-query";

import { useTeddyStore } from "../store/teddyStore";
import { apiClient } from "./apiClient";

/**
 * Hook public du chat Teddy — utilisé par la bulle flottante ET l'écran
 * plein écran (Volume 4 : "Teddy doit apparaître sur le Dashboard, dans les
 * séances, dans la nutrition, après les entraînements, dans les rapports").
 * L'état de conversation est partagé via `teddyStore` pour que la bulle et
 * l'écran plein écran restent synchronisés sans re-fetch.
 */
export function useSendTeddyMessage() {
  const { conversationId, addMessage, setConversationId, setTyping, setSuggestedActions } = useTeddyStore();

  return useMutation({
    mutationFn: async (message: string) => {
      addMessage({ id: crypto.randomUUID(), role: "user", content: message, createdAt: new Date().toISOString() });
      setTyping(true);
      return apiClient.post<TeddyReply & { conversationId: string }>("/teddy/chat", {
        conversationId: conversationId ?? undefined,
        message,
      });
    },
    onSuccess: (reply) => {
      setConversationId(reply.conversationId);
      addMessage(reply.message);
      setSuggestedActions(reply.suggestedActions ?? []);
      setTyping(false);
    },
    onError: () => setTyping(false),
  });
}

export function useSendTeddyVoice() {
  const { conversationId, setConversationId, addMessage, setTyping } = useTeddyStore();

  return useMutation({
    mutationFn: (formData: FormData) => {
      if (conversationId) formData.append("conversationId", conversationId);
      setTyping(true);
      return apiClient.upload<TeddyReply & { conversationId: string }>("/teddy/voice", formData);
    },
    onSuccess: (reply) => {
      setConversationId(reply.conversationId);
      addMessage(reply.message);
      setTyping(false);
    },
    onError: () => setTyping(false),
  });
}

export function useGenerateChallenge() {
  return useMutation({
    mutationFn: (input: { focus: string; durationDays: number }) => apiClient.post("/teddy/challenge", input),
  });
}

export function useAnalyzeProgress() {
  return useMutation({
    mutationFn: (periodDays: number) => apiClient.post("/teddy/analyze-progress", { periodDays }),
  });
}
