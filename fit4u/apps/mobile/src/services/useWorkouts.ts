import { queryKeys } from "@fit4u/api-client";
import type { PersonalRecordDTO, WorkoutSessionDTO, WorkoutStatisticsDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useWorkoutStore } from "../store/workoutStore";
import { apiClient } from "./apiClient";

export function useStartWorkout() {
  const startSession = useWorkoutStore((s) => s.startSession);
  return useMutation({
    mutationFn: (input: { programId?: string; title: string; exerciseIds: string[] }) =>
      apiClient.post<WorkoutSessionDTO>("/workouts/start", input),
    onSuccess: (session) => startSession(session.id, session.exercises),
  });
}

export function usePauseWorkout() {
  return useMutation({
    mutationFn: (workoutSessionId: string) => apiClient.post("/workouts/pause", { workoutSessionId }),
  });
}

export function useResumeWorkout() {
  return useMutation({
    mutationFn: (workoutSessionId: string) => apiClient.post("/workouts/resume", { workoutSessionId }),
  });
}

export function useFinishWorkout() {
  const queryClient = useQueryClient();
  const resetStore = useWorkoutStore((s) => s.reset);

  return useMutation({
    mutationFn: (input: {
      workoutSessionId: string;
      caloriesBurned?: number;
      exercises: { exerciseId: string; setsCompleted: number; repsCompleted?: number; weightUsedKg?: number }[];
    }) => apiClient.post<WorkoutSessionDTO>("/workouts/finish", input),
    onSuccess: () => {
      resetStore();
      void queryClient.invalidateQueries({ queryKey: queryKeys.workouts.history });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workouts.statistics });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workouts.personalRecords });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
    },
  });
}

export function useWorkoutHistory() {
  return useQuery({
    queryKey: queryKeys.workouts.history,
    queryFn: () => apiClient.get<{ items: WorkoutSessionDTO[]; total: number }>("/workouts/history"),
  });
}

export function useWorkoutStatistics() {
  return useQuery({
    queryKey: queryKeys.workouts.statistics,
    queryFn: () => apiClient.get<WorkoutStatisticsDTO>("/workouts/statistics"),
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: queryKeys.workouts.personalRecords,
    queryFn: () => apiClient.get<PersonalRecordDTO[]>("/workouts/personal-records"),
  });
}
