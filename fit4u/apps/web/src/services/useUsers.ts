import { queryKeys } from "@fit4u/api-client";
import type { ProfileDTO, UserDTO } from "@fit4u/types";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => apiClient.get<{ profile: ProfileDTO } & UserDTO>("/users/me"),
    enabled,
  });
}

export function useUserStatistics() {
  return useQuery({
    queryKey: queryKeys.users.statistics,
    queryFn: () => apiClient.get("/users/statistics"),
  });
}
