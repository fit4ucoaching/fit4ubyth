import type { Server, Socket } from "socket.io";

import { logger } from "../../config/logger";
import { aiService } from "../../ai/ai.service";

/**
 * Canal `teddy` — chat en temps réel avec le Coach IA. La génération de
 * réponse reste entièrement déléguée à `ai/ai.service.ts` (Volume 3 :
 * "Aucune logique IA ailleurs") ; ce canal ne fait que transporter les
 * événements socket vers/depuis ce service.
 */
export function registerTeddyChannel(_io: Server, socket: Socket): void {
  socket.on("teddy:message", async (payload: { conversationId?: string; content: string }) => {
    try {
      const userId = socket.data.userId as string;
      socket.emit("teddy:typing", { isTyping: true });

      const reply = await aiService.chat(userId, {
        conversationId: payload.conversationId,
        message: payload.content,
      });

      socket.emit("teddy:typing", { isTyping: false });
      socket.emit("teddy:reply", reply);
    } catch (err) {
      logger.error({ err }, "Erreur canal teddy");
      socket.emit("teddy:error", { message: "Teddy n'a pas pu répondre, réessayez." });
    }
  });
}
