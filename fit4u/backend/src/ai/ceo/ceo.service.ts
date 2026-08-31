import OpenAI from "openai";

import { completeCeoTurn, initiateCeoTurn } from "@fit4u/teddy-sdk";
import { env } from "../../config/env";
import { AIRepository } from "../ai.repository";
import { executeCeoTool } from "./ceoToolExecutor";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const aiRepository = new AIRepository();

/**
 * Service Teddy CEO — architecture en 2 phases (initiate → exécution
 * d'outils → complete), réutilise `AIConversation`/`AIMessage` (un admin
 * EST un `User`) sans extension de schéma. Jamais partagé avec le flux
 * utilisateur : `initiateCeoTurn`/`completeCeoTurn` viennent d'un module
 * SDK entièrement distinct (`@fit4u/teddy-sdk/ceo`), pas de risque de
 * mélange de persona.
 */
export class CeoService {
  async chat(adminId: string, conversationId: string | undefined, message: string) {
    const conversation = conversationId
      ? await aiRepository.findConversationById(conversationId, adminId)
      : await aiRepository.createConversation(adminId, "Teddy CEO");

    if (!conversation) {
      throw new Error("Conversation introuvable.");
    }

    const previousMessages = await aiRepository.listMessages(conversation.id);
    const history = previousMessages.map((m) => ({
      role: m.role === "TEDDY" ? ("teddy" as const) : ("user" as const),
      content: m.content,
    }));

    await aiRepository.addMessage({ conversationId: conversation.id, role: "USER", content: message });

    const turn = await initiateCeoTurn(openai, { history, newMessage: message });

    // Architecture en 2 PHASES exactement (pas une boucle à N itérations,
    // contrairement à un commentaire antérieur trompeur ici) : `completeCeoTurn`
    // renvoie toujours une réponse finale, jamais un nouveau
    // `requires_tools` — même limite déjà présente dans `teddyCore.ts`
    // (Volume 5). Un outil qui nécessiterait un second aller-retour d'outils
    // n'est pas supporté par ce SDK à ce jour (limite documentée, pas
    // simulée).
    if (turn.status === "requires_tools") {
      const toolResults = await Promise.all(
        turn.toolCalls.map(async (call) => ({
          toolCallId: call.id,
          result: await executeCeoTool(call.function.name, JSON.parse(call.function.arguments || "{}")),
        })),
      );

      const reply = await completeCeoTurn(openai, turn.pendingMessages, toolResults);
      await aiRepository.addMessage({ conversationId: conversation.id, role: "TEDDY", content: reply.message.content });
      return { message: reply.message, conversationId: conversation.id };
    }

    await aiRepository.addMessage({ conversationId: conversation.id, role: "TEDDY", content: turn.reply.message.content });
    return { message: turn.reply.message, conversationId: conversation.id };
  }
}
