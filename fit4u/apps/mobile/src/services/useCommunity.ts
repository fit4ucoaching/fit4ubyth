import { queryKeys } from "@fit4u/api-client";
import type { GroupDTO, PostDTO } from "@fit4u/types";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCommunityStore } from "../store/communityStore";
import { apiClient } from "./apiClient";

export function usePosts() {
  return useInfiniteQuery({
    queryKey: queryKeys.community.posts,
    queryFn: ({ pageParam }) =>
      apiClient.get<{ items: PostDTO[]; total: number; page: number; pageSize: number }>(
        `/posts?page=${pageParam}&pageSize=20`,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.total ? last.page + 1 : undefined),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const clearDraft = useCommunityStore((s) => s.clearDraft);
  return useMutation({
    mutationFn: (input: { content: string; imageUrl?: string; visibility: string }) =>
      apiClient.post<PostDTO>("/posts", input),
    onSuccess: () => {
      clearDraft();
      void queryClient.invalidateQueries({ queryKey: queryKeys.community.posts });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => apiClient.post("/likes", { postId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.community.posts }),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { postId: string; content: string }) => apiClient.post("/comments", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.community.posts }),
  });
}

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.community.groups,
    queryFn: () => apiClient.get<{ items: GroupDTO[] }>("/groups"),
  });
}
