export type WorkoutStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type GoalType =
  | "WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "PERFORMANCE"
  | "ENDURANCE" | "HYROX" | "RUNNING" | "FOOTBALL" | "MOBILITY";
export type EquipmentType =
  | "BODYWEIGHT" | "DUMBBELLS" | "BARBELL" | "MACHINE"
  | "RESISTANCE_BAND" | "KETTLEBELL" | "CARDIO" | "OTHER";

export interface ExerciseDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  difficultyLevel: DifficultyLevel;
  categoryId: string;
  primaryMuscleId: string;
  caloriesPerMinute?: number;
  images: { url: string; sortOrder: number }[];
  videos: { url: string; durationSeconds?: number }[];
  tips: string[];
  mistakes: string[];
  isFavorite?: boolean;
}

export interface WorkoutExerciseDTO {
  id: string;
  exercise: ExerciseDTO;
  sortOrder: number;
  setsCompleted: number;
  repsCompleted?: number;
  weightUsedKg?: number;
  durationSeconds?: number;
  isCompleted: boolean;
}

export interface WorkoutSessionDTO {
  id: string;
  title: string;
  status: WorkoutStatus;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  caloriesBurned?: number;
  exercises: WorkoutExerciseDTO[];
}

export interface PersonalRecordDTO {
  id: string;
  exercise: ExerciseDTO;
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  achievedAt: string;
}

export interface WorkoutStatisticsDTO {
  totalCompleted: number;
  totalDurationSeconds: number;
  totalCaloriesBurned: number;
}
