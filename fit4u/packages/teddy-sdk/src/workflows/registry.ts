import { LOSE_WEIGHT_WORKFLOW } from "./loseWeightWorkflow";
import type { WorkflowDefinition } from "./types";

/**
 * Registre des workflows disponibles. D'autres workflows suivent
 * exactement le même pattern que `LOSE_WEIGHT_WORKFLOW` (ex.
 * `gain_muscle`, `prepare_event`) — non dupliqués ici pour rester concis,
 * la structure étant strictement identique.
 */
export const WORKFLOW_REGISTRY: WorkflowDefinition[] = [LOSE_WEIGHT_WORKFLOW];

export function findWorkflow(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_REGISTRY.find((w) => w.id === id);
}
