import OpenAI from "openai";
import {
  analyzeFoodPhoto,
  completeTeddyTurn,
  generateChallengeData,
  generateNutritionPlanData,
  generateProgressSummary,
  generateWorkoutPlanData,
  initiateTeddyTurn,
} from "@fit4u/teddy-sdk";
import type { TeddyReply } from "@fit4u/teddy-sdk";

import { env } from "../config/env";
import { NotFoundError } from "../errors";
import { estimateTeddyCostMicroUsd } from "./observability/teddyCost";
import { promptOverrideService } from "../services/promptOverride.service";
import { AIRepository } from "./ai.repository";
import { TeddyMemoryService } from "./memory/teddyMemory.service";
import { executeTool } from "./tools/toolExecutor";
import type {
  AnalyzeProgressInput,
  ChatInput,
  GenerateChallengeInput,
  GenerateNutritionInput,
  GenerateWorkoutInput,
} from "./ai.validators";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Couche d'orchestration backend du Coach IA Teddy (Volume 3). Ne construit
 * JAMAIS de prompt ni n'interprète une réponse IA elle-même — délègue
 * intégralement au SDK `@fit4u/teddy-sdk` (Volume 1). Ses seules
 * responsabilités propres : récupérer le contexte utilisateur (via
 * `TeddyMemoryService`), appeler le SDK, persister le résultat (via
 * `AIRepository`).
 */
export class AIService {
  constructor(
    private readonly aiRepository: AIRepository,
    private readonly memoryService: TeddyMemoryService,
  ) {}

  /**
   * Chat Teddy (Volume 5) — délègue l'orchestration complète à `TeddyCore`
   * (`@fit4u/teddy-sdk`) : sécurité, routage de domaine, chaîne de prompts,
   * appel LLM avec outils. Ce service ne fait que fournir la mémoire à 3
   * niveaux, persister les messages, et exécuter les outils que le LLM
   * demande (seule étape nécessitant Prisma, donc seule étape backend —
   * voir `tools/toolExecutor.ts`).
   */
  async chat(userId: string, input: ChatInput): Promise<TeddyReply & { conversationId: string }> {
    const conversation = input.conversationId
      ? await this.aiRepository.findConversationById(input.conversationId, userId)
      : await this.aiRepository.createConversation(userId);

    if (!conversation) {
      throw new NotFoundError("Conversation introuvable.");
    }

    const memory = await this.memoryService.buildFullMemory(userId, conversation.id);

    // Teddy Control Center — résolution des Domain Prompts éditables
    // (BackOffice), un seul aller-retour DB par tour de conversation.
    // Jamais les prompts d'identité/sécurité, qui restent des constantes
    // TypeScript intouchables depuis le BackOffice (voir schéma Domaine 15).
    const domainPromptOverrides = await promptOverrideService.resolveActiveOverrides();

    await this.aiRepository.addMessage({
      conversationId: conversation.id,
      role: "USER",
      content: input.message,
    });

    let turn = await initiateTeddyTurn(openai, {
      memory,
      history: memory.conversational.recentMessages,
      newMessage: input.message,
      domainContexts: {}, // les modules domaine recevront leur contexte dédié au fil des prochains volumes (ex. Recovery a besoin de données sommeil non encore collectées)
      domainPromptOverrides: domainPromptOverrides as never,
    });

    // Limite connue (détectée en revue continue) : `completeTeddyTurn` renvoie
    // toujours un statut "final", jamais un nouveau "requires_tools" — cette
    // boucle ne s'exécute donc en pratique qu'une seule fois, quel que soit
    // `iterations < 3`. Un enchaînement de plusieurs appels d'outils
    // successifs (ex. outil A puis, selon son résultat, outil B) n'est pas
    // supporté à ce jour ; le modèle doit se contenter des résultats de son
    // premier lot d'appels d'outils pour formuler sa réponse finale.
    let iterations = 0;
    while (turn.status === "requires_tools" && iterations < 3) {
      const toolResults = await Promise.all(
        turn.toolCalls.map(async (call) => ({
          toolCallId: call.id,
          result: await executeTool(call.function.name, userId, JSON.parse(call.function.arguments)),
        })),
      );

      const reply = await completeTeddyTurn(openai, turn.pendingMessages, toolResults);
      turn = { status: "final", reply };
      iterations += 1;
    }

    const finalReply = turn.status === "final" ? turn.reply : { message: { id: crypto.randomUUID(), role: "teddy" as const, content: "Désolé, je n'ai pas pu finaliser ma réponse.", createdAt: new Date().toISOString() } };

    // Observabilité Teddy (Volume 8 §52-53) — jamais le contenu de la
    // conversation elle-même dans des métriques opérationnelles séparées,
    // uniquement tokens/coût/modèle, déjà colocalisés avec le message dont
    // ils sont issus (pas de table de métriques dupliquée à maintenir en cohérence).
    const usageMetadata = finalReply.usage
      ? { usage: finalReply.usage, estimatedCostMicroUsd: estimateTeddyCostMicroUsd(finalReply.usage) }
      : undefined;

    await this.aiRepository.addMessage({
      conversationId: conversation.id,
      role: "TEDDY",
      content: finalReply.message.content,
      metadata: {
        ...(finalReply.suggestedActions ? { suggestedActions: finalReply.suggestedActions } : {}),
        ...usageMetadata,
      },
    });

    return { ...finalReply, conversationId: conversation.id };
  }

  /** Implémente `AIProgramGenerator` (voir `modules/programs/programs.service.ts`). */
  async generateWorkoutProgram(
    userId: string,
    input: GenerateWorkoutInput,
  ): Promise<{ aiWorkoutPlanId: string }> {
    const context = await this.memoryService.buildContext(userId);
    const planData = await generateWorkoutPlanData(openai, this.memoryService.formatForPrompt(context), input);

    const plan = await this.aiRepository.createWorkoutPlan({
      userId,
      rationale: `Généré pour l'objectif ${input.goalType}, niveau ${input.difficultyLevel}, ${input.durationWeeks} semaines.`,
      planData,
    });

    return { aiWorkoutPlanId: plan.id };
  }

  async generateNutritionPlan(userId: string, input: GenerateNutritionInput): Promise<{ aiNutritionPlanId: string }> {
    const context = await this.memoryService.buildContext(userId);
    const planData = await generateNutritionPlanData(openai, this.memoryService.formatForPrompt(context), input);

    const plan = await this.aiRepository.createNutritionPlan({
      userId,
      rationale: `Plan nutritionnel généré (${input.mealsPerDay} repas/jour).`,
      planData,
    });

    return { aiNutritionPlanId: plan.id };
  }

  async analyzeProgress(userId: string, input: AnalyzeProgressInput) {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - input.periodDays * 24 * 60 * 60 * 1000);

    const context = await this.memoryService.buildContext(userId);
    const rawData = JSON.stringify({
      recentWorkoutCount: context.recentWorkoutCount,
      currentWeightKg: context.currentWeightKg,
      goals: context.goals,
    });

    const summary = await generateProgressSummary(openai, this.memoryService.formatForPrompt(context), rawData);

    const report = await this.aiRepository.createProgressReport({
      userId,
      periodStart,
      periodEnd,
      summary,
      reportData: { context, periodDays: input.periodDays },
    });

    return report;
  }

  async generateChallenge(userId: string, input: GenerateChallengeInput) {
    const context = await this.memoryService.buildContext(userId);
    const data = (await generateChallengeData(openai, this.memoryService.formatForPrompt(context), input)) as {
      title: string;
      description: string;
      targetData: Record<string, unknown>;
    };

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + input.durationDays * 24 * 60 * 60 * 1000);

    return this.aiRepository.createChallenge({
      userId,
      title: data.title,
      description: data.description,
      targetData: data.targetData,
      startDate,
      endDate,
    });
  }

  /** Analyse une photo de repas (Vision) — voir `modules/nutrition`. */
  async analyzeFoodPhoto(imageBase64DataUrl: string) {
    return analyzeFoodPhoto(openai, imageBase64DataUrl);
  }

  /** Transcrit un message vocal (Whisper) puis le traite comme un message de chat classique. */
  async voice(userId: string, audio: Express.Multer.File, conversationId?: string) {
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audio.buffer], audio.originalname, { type: audio.mimetype }),
      model: "whisper-1",
    });

    return this.chat(userId, { conversationId, message: transcription.text });
  }
}

// Instance partagée — consommée par `websocket/channels/teddy.channel.ts` et
// injectée comme `AIProgramGenerator` dans les modules `programs`/`nutrition`.
const aiRepository = new AIRepository();
const teddyMemoryService = new TeddyMemoryService(aiRepository);
export const aiService = new AIService(aiRepository, teddyMemoryService);
