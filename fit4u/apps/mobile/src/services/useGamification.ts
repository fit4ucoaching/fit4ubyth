import { queryKeys } from "@fit4u/api-client";
import type { BadgeDTO, ChallengeDTO, UserXpDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function useGamificationProfile() {
  return useQuery({
    queryKey: queryKeys.gamification.profile,
    queryFn: () => apiClient.get<UserXpDTO>("/gamification/profile"),
  });
}

export function useBadges() {
  return useQuery({
    queryKey: queryKeys.gamification.badges,
    queryFn: () => apiClient.get<BadgeDTO[]>("/gamification/badges"),
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: queryKeys.gamification.challenges,
    queryFn: () => apiClient.get<{ items: ChallengeDTO[] }>("/gamification/challenges"),
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => apiClient.post(`/gamification/challenges/${challengeId}/join`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.gamification.challenges }),
  });
}

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => apiClient.post(`/gamification/challenges/${challengeId}/complete`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.challenges });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
    },
  });
}
