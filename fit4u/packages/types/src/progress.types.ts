export interface WeightEntryDTO {
  id: string;
  weightKg: number;
  recordedAt: string;
}

export interface MeasurementEntryDTO {
  id: string;
  bodyPart: string;
  valueCm: number;
  recordedAt: string;
}

export interface ProgressPhotoDTO {
  id: string;
  url: string;
  angle?: string;
  recordedAt: string;
}

export interface ProgressAnalyticsDTO {
  weightTrendKg: number;
  dataPoints: number;
  totalGoals: number;
  achievedGoals: number;
}

import type { GoalType } from "./workout.types";

export interface GoalDTO {
  id: string;
  type: GoalType;
  title: string;
  targetValue?: number;
  currentValue?: number;
  targetDate?: string;
  achievedAt?: string;
}
