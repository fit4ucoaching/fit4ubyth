export type VoiceCommandType =
  | "start_workout" | "pause_workout" | "resume_workout" | "finish_workout"
  | "replace_exercise" | "generate_quick_workout" | "log_water" | "unknown";

export interface ParsedVoiceCommand {
  type: VoiceCommandType;
  params: Record<string, string | number>;
  rawText: string;
}
