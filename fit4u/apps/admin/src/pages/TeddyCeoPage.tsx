import { useState } from "react";
import { Bot, Send, User } from "lucide-react";

import { Button, Card } from "../components/ui";
import { useCeoChat } from "../services/useTeddyCeo";

interface DisplayMessage {
  role: "user" | "teddy";
  content: string;
}

const SUGGESTIONS = [
  "Résume les KPI de la plateforme",
  "Y a-t-il des anomalies cette semaine ?",
  "Quels utilisateurs risquent de résilier ?",
  "Quels sont les programmes les plus performants ?",
];

/**
 * Teddy CEO (Evolution.md concrétisé) — assistant conversationnel pour
 * l'équipe, jamais le coach utilisateur (persona et endpoint totalement
 * distincts, voir `backend/src/ai/ceo/`). Historique gardé en mémoire
 * React uniquement le temps de la session — la persistance réelle vit
 * côté `AIConversation` (backend), rechargeable via `conversationId` si
 * besoin futur d'un historique multi-session dans cette page.
 */
export function TeddyCeoPage(): JSX.Element {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const chat = useCeoChat();

  const sendMessage = (text: string): void => {
    if (!text.trim() || chat.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    chat.mutate(
      { conversationId, message: text },
      {
        onSuccess: (response) => {
          setConversationId(response.conversationId);
          setMessages((prev) => [...prev, { role: "teddy", content: response.message.content }]);
        },
        onError: () => setMessages((prev) => [...prev, { role: "teddy", content: "Désolé, une erreur est survenue." }]),
      },
    );
  };

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-4 flex items-center gap-3">
        <Bot className="text-primary" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Teddy CEO</h1>
          <p className="text-xs text-textSecondary">Assistant d'analyse plateforme — jamais le coach utilisateur</p>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-2">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Bot size={40} className="text-textTertiary" />
              <p className="text-sm text-textSecondary">Posez une question sur les KPI, anomalies, ou risques de résiliation.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="rounded-full border border-border px-3 py-1.5 text-xs text-textSecondary hover:bg-surface">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "teddy" ? <Bot size={20} className="mt-1 shrink-0 text-primary" /> : null}
                <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-surface text-textPrimary"}`}>
                  {m.content}
                </div>
                {m.role === "user" ? <User size={20} className="mt-1 shrink-0 text-textSecondary" /> : null}
              </div>
            ))
          )}
          {chat.isPending ? <p className="text-xs text-textTertiary">Teddy réfléchit…</p> : null}
        </div>

        <div className="flex gap-2 border-t border-border pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Poser une question à Teddy CEO…"
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-textPrimary"
          />
          <Button onClick={() => sendMessage(input)} isLoading={chat.isPending}>
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
