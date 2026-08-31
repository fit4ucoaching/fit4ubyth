import type { ParsedVoiceCommand, VoiceCommandType } from "./types";

/**
 * Interface vocale (Volume 5 : "Teddy, lance ma séance.", "Teddy, remplace
 * les burpees.", "Teddy, fais-moi une séance de 20 minutes."). Reconnaissance
 * par patterns (déterministe, rapide, sans coût LLM) — un texte qui ne
 * correspond à aucun pattern retombe en `type: "unknown"` et est traité
 * comme un message de chat classique par `TeddyCore` (jamais d'échec sec).
 *
 * L'audio→texte reste géré en amont par Whisper (voir
 * `backend/src/ai/ai.service.ts#voice`) — ce module ne traite que le texte
 * déjà transcrit.
 */
const COMMAND_PATTERNS: { type: VoiceCommandType; pattern: RegExp }[] = [
  { type: "start_workout", pattern: /lance (ma |la )?séance|commence (l'|la )?entraînement|démarre (ma |la )?séance/i },
  { type: "pause_workout", pattern: /mets? (la |ma )?séance en pause|pause (la |ma )?séance/i },
  { type: "resume_workout", pattern: /reprends? (la |ma )?séance|continue (la |ma )?séance/i },
  { type: "finish_workout", pattern: /termine (la |ma )?séance|finis (la |ma )?séance|arrête (la |ma )?séance/i },
  { type: "log_water", pattern: /j'ai bu|ajoute (de l'|de la )?eau|log(ue)? (de l'|de la )?eau/i },
];

const REPLACE_EXERCISE_PATTERN = /remplace (les |le |la )?(.+)/i;
const QUICK_WORKOUT_PATTERN = /séance de (\d+)\s*minutes?/i;

export function parseVoiceCommand(rawText: string): ParsedVoiceCommand {
  const replaceMatch = rawText.match(REPLACE_EXERCISE_PATTERN);
  if (replaceMatch?.[2]) {
    return { type: "replace_exercise", params: { exerciseName: replaceMatch[2].trim() }, rawText };
  }

  const quickWorkoutMatch = rawText.match(QUICK_WORKOUT_PATTERN);
  if (quickWorkoutMatch?.[1]) {
    return { type: "generate_quick_workout", params: { durationMinutes: Number(quickWorkoutMatch[1]) }, rawText };
  }

  for (const { type, pattern } of COMMAND_PATTERNS) {
    if (pattern.test(rawText)) {
      return { type, params: {}, rawText };
    }
  }

  return { type: "unknown", params: {}, rawText };
}
