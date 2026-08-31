/**
 * Système hiérarchique de prompts (Volume 5) :
 *   System Prompt → Safety Prompt → Domain Prompt → User Memory →
 *   Conversation Context → Tool Results → Final Response
 *
 * "Ne jamais mélanger les responsabilités" : chaque étage a un rôle unique
 * et ne connaît pas le contenu des autres — `buildPromptChain()` est le SEUL
 * endroit du SDK qui les assemble. Aucun module (`coach`, `nutrition`,
 * `recovery`…) ne construit de prompt final lui-même ; il fournit uniquement
 * son étage "Domain Prompt" à la chaîne.
 */

export interface PromptChainInput {
  /** Identité et ton de Teddy — invariant, jamais personnalisé. */
  systemPrompt: string;
  /** Garde-fous de sécurité — toujours présent, même si aucun signal n'est détecté ce tour-ci. */
  safetyPrompt: string;
  /** Instructions spécifiques au module actif (Coach, Nutrition, Recovery…). */
  domainPrompt: string;
  /** Mémoire utilisateur formatée (voir `memory/formatMemory.ts`). */
  userMemory: string;
  /** Contexte de conversation récent (derniers messages ou résumé). */
  conversationContext: string;
  /** Résultats d'outils déjà exécutés ce tour-ci (ex. données renvoyées par `GetProgress`). */
  toolResults?: string;
}

/**
 * Assemble la chaîne en un prompt système unique, dans l'ordre imposé.
 * Chaque étage est délimité par un en-tête XML-like — facilite le debug
 * (on voit immédiatement quel étage a produit quelle instruction) et évite
 * toute ambiguïté d'interprétation par le modèle entre "qui dit quoi".
 */
export function buildPromptChain(input: PromptChainInput): string {
  const sections = [
    `<system>\n${input.systemPrompt}\n</system>`,
    `<safety>\n${input.safetyPrompt}\n</safety>`,
    `<domain>\n${input.domainPrompt}\n</domain>`,
    `<user_memory>\n${input.userMemory}\n</user_memory>`,
    `<conversation_context>\n${input.conversationContext}\n</conversation_context>`,
    input.toolResults ? `<tool_results>\n${input.toolResults}\n</tool_results>` : null,
  ];

  return sections.filter((s): s is string => s !== null).join("\n\n");
}
