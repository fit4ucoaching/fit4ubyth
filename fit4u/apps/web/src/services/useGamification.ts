import { queryKeys } from "@fit4u/api-client";
import type { UserXpDTO } from "@fit4u/types";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function useGamificationProfile() {
  return useQuery({
    queryKey: queryKeys.gamification.profile,
    queryFn: () => apiClient.get<UserXpDTO>("/gamification/profile"),
  });
}
