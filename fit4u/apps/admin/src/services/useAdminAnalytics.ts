import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface TrendPoint { day: string; value: number }
export interface RetentionCohort { week: string; cohortSize: number; retainedCount: number; retentionRate: number }
export interface TopExercise { exerciseId: string; exerciseName: string; completedCount: number }
export interface TopProgram { programId: string; programName: string; completedSessionsCount: number }

export function useUserGrowth(days: number) {
  return useQuery({ queryKey: ["admin", "analytics", "user-growth", days], queryFn: () => apiClient.get<TrendPoint[]>(`/admin/analytics/user-growth?days=${days}`) });
}

export function useRevenueTrend(days: number) {
  return useQuery({ queryKey: ["admin", "analytics", "revenue-trend", days], queryFn: () => apiClient.get<TrendPoint[]>(`/admin/analytics/revenue-trend?days=${days}`) });
}

export function useWorkoutEngagement(days: number) {
  return useQuery({ queryKey: ["admin", "analytics", "workout-engagement", days], queryFn: () => apiClient.get<TrendPoint[]>(`/admin/analytics/workout-engagement?days=${days}`) });
}

export function useTeddyUsage(days: number) {
  return useQuery({ queryKey: ["admin", "analytics", "teddy-usage", days], queryFn: () => apiClient.get<TrendPoint[]>(`/admin/analytics/teddy-usage?days=${days}`) });
}

export function useRetentionCohorts(weeksBack: number) {
  return useQuery({ queryKey: ["admin", "analytics", "retention", weeksBack], queryFn: () => apiClient.get<RetentionCohort[]>(`/admin/analytics/retention?weeksBack=${weeksBack}`) });
}

export function useTopExercises(limit: number) {
  return useQuery({ queryKey: ["admin", "analytics", "top-exercises", limit], queryFn: () => apiClient.get<TopExercise[]>(`/admin/analytics/top-exercises?limit=${limit}`) });
}

export function useTopPrograms(limit: number) {
  return useQuery({ queryKey: ["admin", "analytics", "top-programs", limit], queryFn: () => apiClient.get<TopProgram[]>(`/admin/analytics/top-programs?limit=${limit}`) });
}
