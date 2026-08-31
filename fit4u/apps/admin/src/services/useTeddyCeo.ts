import { useMutation } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface CeoChatResponse {
  message: { id: string; role: "teddy"; content: string; createdAt: string };
  conversationId: string;
}

export function useCeoChat() {
  return useMutation({
    mutationFn: (input: { conversationId?: string; message: string }) => apiClient.post<CeoChatResponse>("/admin/teddy-ceo/chat", input),
  });
}
