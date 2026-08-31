import { queryKeys } from "@fit4u/api-client";
import type { WorkoutStatisticsDTO } from "@fit4u/types";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function useWorkoutStatistics() {
  return useQuery({
    queryKey: queryKeys.workouts.statistics,
    queryFn: () => apiClient.get<WorkoutStatisticsDTO>("/workouts/statistics"),
  });
}
