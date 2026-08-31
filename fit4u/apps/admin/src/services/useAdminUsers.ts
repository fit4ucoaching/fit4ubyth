import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface AdminUserRow {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  profile: { firstName: string; lastName: string } | null;
  userRoles: { role: { name: string } }[];
}

export function useAdminUsersList(params: { page: number; pageSize: number; q?: string; status?: string }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])),
      );
      return apiClient.get<{ items: AdminUserRow[]; total: number }>(`/admin/users?${query.toString()}`);
    },
  });
}

export function useAdminUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => apiClient.get(`/admin/users/${userId}`),
    enabled: Boolean(userId),
  });
}

function useAdminUserMutation(action: (id: string, body?: unknown) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body?: unknown }) => action(userId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useSuspendUser() {
  return useAdminUserMutation((id) => apiClient.post(`/admin/users/${id}/suspend`));
}
export function useReactivateUser() {
  return useAdminUserMutation((id) => apiClient.post(`/admin/users/${id}/reactivate`));
}
export function useDeleteUser() {
  return useAdminUserMutation((id) => apiClient.delete(`/admin/users/${id}`));
}
export function useChangeUserRole() {
  return useAdminUserMutation((id, body) => apiClient.put(`/admin/users/${id}/role`, body));
}
export function useGrantUserPremium() {
  return useAdminUserMutation((id, body) => apiClient.put(`/admin/users/${id}/premium`, body));
}
export function useResetUserPassword() {
  return useAdminUserMutation((id) => apiClient.post(`/admin/users/${id}/reset-password`));
}
