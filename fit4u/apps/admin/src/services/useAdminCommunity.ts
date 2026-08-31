import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface ReportRow {
  id: string;
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";
  reporter: { email: string };
  createdAt: string;
}

export interface BanRow {
  id: string;
  reason: string;
  expiresAt: string | null;
  liftedAt: string | null;
  createdAt: string;
  user: { email: string; profile: { firstName: string; lastName: string } | null };
}

export function useReportsList(params: { page: number; pageSize: number; status?: string }) {
  return useQuery({
    queryKey: ["admin", "community", "reports", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.status ? { status: params.status } : {}) });
      return apiClient.get<{ items: ReportRow[]; total: number }>(`/admin/community/reports?${query.toString()}`);
    },
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "DISMISSED" | "ACTIONED" }) => apiClient.post(`/admin/community/reports/${id}/review`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "community", "reports"] }),
  });
}

export function useBansList(params: { page: number; pageSize: number; activeOnly?: boolean }) {
  return useQuery({
    queryKey: ["admin", "community", "bans", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), activeOnly: String(params.activeOnly ?? false) });
      return apiClient.get<{ items: BanRow[]; total: number }>(`/admin/community/bans?${query.toString()}`);
    },
  });
}

export function useLiftBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/community/bans/${id}/lift`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "community", "bans"] }),
  });
}
