import type { ToolDefinition } from "../tools/types";

/**
 * Outils Teddy CEO (Evolution.md concrétisé) — schéma déclaré ici (SDK),
 * exécution réelle côté backend (`backend/src/ai/ceo/ceoToolExecutor.ts`),
 * même séparation stricte que les outils utilisateur (Volume 5).
 */
export const CEO_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "GetKPISummary",
    description: "Récupère les indicateurs clés de la plateforme (utilisateurs, revenus, VIP, abonnements, support).",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "DetectAnomalies",
    description: "Compare les métriques de la période courante à la période précédente et signale les écarts significatifs.",
    parameters: {
      type: "object",
      properties: { periodDays: { type: "number", description: "Taille de la période à comparer, en jours (7 par défaut)" } },
      required: [],
    },
  },
  {
    name: "GetChurnRiskUsers",
    description: "Liste les utilisateurs abonnés actifs mais inactifs depuis longtemps (risque de résiliation).",
    parameters: {
      type: "object",
      properties: { inactivityDays: { type: "number", description: "Seuil d'inactivité en jours (14 par défaut)" } },
      required: [],
    },
  },
  {
    name: "GetTopPerformingPrograms",
    description: "Classe les programmes d'entraînement par nombre de séances complétées.",
    parameters: {
      type: "object",
      properties: { limit: { type: "number", description: "Nombre de programmes à retourner (5 par défaut)" } },
      required: [],
    },
  },
];

export function toOpenAICeoToolsFormat(): { type: "function"; function: ToolDefinition }[] {
  return CEO_TOOL_DEFINITIONS.map((tool) => ({ type: "function", function: tool }));
}
