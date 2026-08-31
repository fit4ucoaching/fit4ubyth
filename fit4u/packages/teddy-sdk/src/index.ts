// Types & prompts historiques (Volume 1/3) — conservés pour compatibilité ascendante.
export * from "./types/teddy.types";
export * from "./services/teddyConversationService";
export * from "./services/teddyGenerationService";
export * from "./prompts/systemPrompts";

// Volume 5 — 10 modules du moteur Teddy AI.
export * from "./core";
export * from "./memory";
export * from "./coach";
export * from "./nutrition";
export * from "./recovery";
export * from "./motivation";
export * from "./analytics";
export * from "./planner";
export * from "./voice";
export * from "./vision";
export * from "./tools";
export * from "./workflows";
export * from "./ceo";
export * from "./safety/teddySafetyService";

// Système hiérarchique de prompts (Volume 5).
export * from "./prompts/identityPrompt";
export * from "./prompts/globalSafetyPrompt";
export * from "./prompts/promptChain";
