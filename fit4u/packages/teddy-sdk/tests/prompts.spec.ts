import { describe, expect, it } from "vitest";

import { buildPromptChain } from "../src/prompts/promptChain";
import { TEDDY_GLOBAL_SAFETY_PROMPT } from "../src/prompts/globalSafetyPrompt";
import { TEDDY_IDENTITY_PROMPT } from "../src/prompts/identityPrompt";

/**
 * Prompt tests (Volume 5) — vérifie que la chaîne hiérarchique respecte
 * l'ordre imposé (System → Safety → Domain → Memory → Context → Tools) et
 * que chaque étage reste correctement délimité, sans mélange.
 */
describe("buildPromptChain", () => {
  const baseInput = {
    systemPrompt: TEDDY_IDENTITY_PROMPT,
    safetyPrompt: TEDDY_GLOBAL_SAFETY_PROMPT,
    domainPrompt: "Instructions du domaine Coach.",
    userMemory: "Mémoire de l'utilisateur.",
    conversationContext: "Contexte de conversation.",
  };

  it("respecte l'ordre System → Safety → Domain → Memory → Context", () => {
    const result = buildPromptChain(baseInput);
    const systemIndex = result.indexOf("<system>");
    const safetyIndex = result.indexOf("<safety>");
    const domainIndex = result.indexOf("<domain>");
    const memoryIndex = result.indexOf("<user_memory>");
    const contextIndex = result.indexOf("<conversation_context>");

    expect(systemIndex).toBeLessThan(safetyIndex);
    expect(safetyIndex).toBeLessThan(domainIndex);
    expect(domainIndex).toBeLessThan(memoryIndex);
    expect(memoryIndex).toBeLessThan(contextIndex);
  });

  it("n'inclut pas la section tool_results si aucun résultat n'est fourni", () => {
    const result = buildPromptChain(baseInput);
    expect(result).not.toContain("<tool_results>");
  });

  it("inclut la section tool_results en dernier si fournie", () => {
    const result = buildPromptChain({ ...baseInput, toolResults: "Résultat de l'outil GetProgress." });
    expect(result).toContain("<tool_results>");
    expect(result.indexOf("<tool_results>")).toBeGreaterThan(result.indexOf("<conversation_context>"));
  });

  it("l'identité de Teddy ne contient jamais de données utilisateur", () => {
    expect(TEDDY_IDENTITY_PROMPT).not.toMatch(/\{|\$\{/); // aucune interpolation — invariant par construction
  });

  it("le prompt de sécurité globale mentionne explicitement le dopage et le diagnostic médical", () => {
    expect(TEDDY_GLOBAL_SAFETY_PROMPT.toLowerCase()).toContain("dopant");
    expect(TEDDY_GLOBAL_SAFETY_PROMPT.toLowerCase()).toContain("diagnostic");
  });
});
