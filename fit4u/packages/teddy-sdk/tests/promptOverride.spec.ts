import { describe, expect, it, vi } from "vitest";
import type OpenAI from "openai";

import { initiateTeddyTurn } from "../src/core/teddyCore";
import type { TeddyFullMemory } from "../src/memory/types";

/**
 * Teddy Control Center (SDK) — vérifie que `domainPromptOverrides` est
 * réellement pris en compte par `initiateTeddyTurn`, et que l'identité/
 * sécurité restent TOUJOURS présentes même quand un Domain Prompt est
 * remplacé (jamais un override qui pourrait supplanter les garde-fous).
 */
describe("initiateTeddyTurn — Domain Prompt overrides", () => {
  const baseMemory: TeddyFullMemory = {
    permanent: { firstName: "Alex", locale: "fr", goals: [], availableEquipment: [], dietaryPreferences: [], declaredInjuries: [] },
    evolutive: {
      currentWeightKg: 78, latestMeasurements: [], recentPerformances: [], favoriteExerciseNames: [],
      replacedExerciseNames: [], usualWorkoutHours: [], weeklyFrequency: 3, likedRecipeNames: [], completedChallengeTitles: [],
    },
    conversational: { recentMessages: [] },
  };

  function buildMockOpenAI(): { client: OpenAI; getLastSystemMessage: () => string } {
    let lastSystemMessage = "";
    const client = {
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async (params: { messages: { role: string; content: string }[] }) => {
            lastSystemMessage = params.messages.find((m) => m.role === "system")?.content ?? "";
            return { choices: [{ message: { content: "Réponse simulée", tool_calls: undefined } }] };
          }),
        },
      },
    } as unknown as OpenAI;
    return { client, getLastSystemMessage: () => lastSystemMessage };
  }

  it("utilise l'override du domaine détecté au lieu du Domain Prompt codé en dur", async () => {
    const { client, getLastSystemMessage } = buildMockOpenAI();
    const MARKER = "TON_PERSONNALISE_XYZ_JAMAIS_DANS_LE_PROMPT_PAR_DEFAUT";

    await initiateTeddyTurn(client, {
      memory: baseMemory,
      history: [],
      newMessage: "Peux-tu me proposer une séance de musculation ?", // déclenche le domaine "coach"
      domainContexts: {},
      domainPromptOverrides: { coach: MARKER },
    });

    expect(getLastSystemMessage()).toContain(MARKER);
  });

  it("retombe sur le Domain Prompt codé en dur si aucune override n'existe pour le domaine détecté", async () => {
    const { client, getLastSystemMessage } = buildMockOpenAI();

    await initiateTeddyTurn(client, {
      memory: baseMemory,
      history: [],
      newMessage: "Peux-tu me proposer une séance de musculation ?",
      domainContexts: {},
      domainPromptOverrides: { nutrition: "Override qui ne devrait jamais s'appliquer ici" },
    });

    expect(getLastSystemMessage()).not.toContain("Override qui ne devrait jamais s'appliquer ici");
  });

  it("l'identité et la sécurité globale restent TOUJOURS présentes, même avec un override actif", async () => {
    const { client, getLastSystemMessage } = buildMockOpenAI();

    await initiateTeddyTurn(client, {
      memory: baseMemory,
      history: [],
      newMessage: "Peux-tu me proposer une séance de musculation ?",
      domainContexts: {},
      domainPromptOverrides: { coach: "Un ton complètement différent, très bref." },
    });

    const systemMessage = getLastSystemMessage();
    expect(systemMessage).toContain("Teddy"); // identité toujours injectée
    expect(systemMessage.length).toBeGreaterThan(200); // sécurité globale non tronquée par l'override
  });

  it("un message ne déclenchant aucun domaine spécifique ('general') n'utilise jamais d'override", async () => {
    const { client, getLastSystemMessage } = buildMockOpenAI();

    await initiateTeddyTurn(client, {
      memory: baseMemory,
      history: [],
      newMessage: "Bonjour !",
      domainContexts: {},
      domainPromptOverrides: { coach: "Ne devrait jamais apparaître pour un message générique" },
    });

    expect(getLastSystemMessage()).not.toContain("Ne devrait jamais apparaître pour un message générique");
  });
});
