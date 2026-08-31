/**
 * Contrat d'outil (Volume 5 : "Teddy peut utiliser des outils internes...
 * Chaque outil est une fonction backend"). Le SDK définit ici uniquement le
 * SCHÉMA (nom, description, paramètres JSON Schema pour le function-calling
 * OpenAI) — jamais l'implémentation, qui vit côté backend
 * (`backend/src/ai/tools/`, seul endroit autorisé à parler à Prisma via les
 * repositories). "Teddy ne connaît jamais directement Prisma. Toujours
 * passer par Services/Repositories/Tools."
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export type ToolExecutor = (userId: string, args: Record<string, unknown>) => Promise<unknown>;
