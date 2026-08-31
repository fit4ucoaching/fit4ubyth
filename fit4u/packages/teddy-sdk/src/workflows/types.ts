export interface WorkflowStep {
  name: string;
  toolName?: string;
  description: string;
}

export interface WorkflowDefinition {
  id: string;
  trigger: string;
  steps: WorkflowStep[];
}

export interface WorkflowExecutionContext {
  userId: string;
  input: Record<string, unknown>;
}

export type WorkflowStepResults = Record<string, unknown>;
