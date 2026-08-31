export interface CoachContext {
  goalType: string;
  fitnessLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  availableEquipment: string[];
  sessionsPerWeek: number;
  durationWeeks: number;
  /** Signal de fatigue le plus récent (voir module `recovery`) — influence directement le volume proposé. */
  recoveryStatus?: "normal" | "light" | "active_recovery" | "rest";
  /** Historique court pour éviter de reproposer exactement le même plan que la semaine dernière. */
  recentExerciseNames: string[];
}

export interface WorkoutAdaptation {
  volumeMultiplier: number;
  intensityMultiplier: number;
  restSecondsAdjustment: number;
  reason: string;
}
