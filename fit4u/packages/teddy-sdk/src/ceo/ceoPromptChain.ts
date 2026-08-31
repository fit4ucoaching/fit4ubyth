/**
 * Chaîne de prompts dédiée au Teddy CEO — même principe que
 * `prompts/promptChain.ts` (System→Safety→Domain→Context→Tools) mais sans
 * étage "User Memory" (aucune mémoire individuelle applicable à un
 * contexte plateforme). Fichier séparé plutôt que de forcer un slot
 * `userMemory` sémantiquement inadapté dans la chaîne utilisateur.
 */
export interface CeoPromptChainInput {
  systemPrompt: string;
  safetyPrompt: string;
  platformContext: string;
  conversationContext: string;
  toolResults?: string;
}

export function buildCeoPromptChain(input: CeoPromptChainInput): string {
  const sections = [
    `<system>\n${input.systemPrompt}\n</system>`,
    `<safety>\n${input.safetyPrompt}\n</safety>`,
    `<platform_context>\n${input.platformContext}\n</platform_context>`,
    `<conversation_context>\n${input.conversationContext}\n</conversation_context>`,
    input.toolResults ? `<tool_results>\n${input.toolResults}\n</tool_results>` : null,
  ];

  return sections.filter((s): s is string => s !== null).join("\n\n");
}
