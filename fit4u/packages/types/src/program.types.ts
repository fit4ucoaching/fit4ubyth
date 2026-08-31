import type { DifficultyLevel, GoalType } from "./workout.types";

export interface ProgramSummaryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  goalType: GoalType;
  difficultyLevel: DifficultyLevel;
  durationWeeks: number;
  coverImageUrl?: string;
  isPremium: boolean;
}

export interface ProgramDayDTO {
  id: string;
  dayNumber: number;
  title?: string;
  isRestDay: boolean;
  exercises: { exerciseId: string; sets: number; reps?: number; restSeconds: number }[];
}

export interface ProgramWeekDTO {
  id: string;
  weekNumber: number;
  title?: string;
  days: ProgramDayDTO[];
}

export interface ProgramDetailDTO extends ProgramSummaryDTO {
  weeks: ProgramWeekDTO[];
}
