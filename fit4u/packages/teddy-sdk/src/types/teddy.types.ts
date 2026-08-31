export type TeddyMessageRole = "user" | "teddy" | "system";

export interface TeddyMessage {
  id: string;
  role: TeddyMessageRole;
  content: string;
  createdAt: string;
}

export interface TeddyConversationContext {
  userId: string;
  locale: string;
  userProfile?: {
    goals?: string[];
    dietaryPreferences?: string[];
    fitnessLevel?: "beginner" | "intermediate" | "advanced";
  };
}

export interface TeddyReply {
  message: TeddyMessage;
  suggestedActions?: TeddySuggestedAction[];
  /** Observabilité IA (Volume 8 §52-53) — absent si le prestataire ne renvoie pas l'usage (ex. réponse de sécurité codée en dur, aucun appel LLM effectué). */
  usage?: TeddyUsage;
}

export interface TeddyUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface TeddySuggestedAction {
  type: "log_meal" | "start_workout" | "set_goal" | "view_progress";
  label: string;
  payload?: Record<string, unknown>;
}
