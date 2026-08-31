import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface VipAccessRow {
  id: string;
  email: string;
  userId: string | null;
  isLifetime: boolean;
  startDate: string;
  endDate: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
}

export function useAdminVipList(params: { page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["admin", "vip", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize) });
      return apiClient.get<{ items: VipAccessRow[]; total: number }>(`/admin/vip?${query.toString()}`);
    },
  });
}

export function useGrantVip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; isLifetime: boolean; endDate?: string; note?: string }) =>
      apiClient.post<VipAccessRow>("/admin/vip", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "vip"] }),
  });
}

export function useRevokeVip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/vip/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "vip"] }),
  });
}

export interface ImportVipCsvResult {
  importedCount: number;
  invalidCount: number;
  totalLines: number;
}

export function useImportVipCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { csvContent: string; isLifetime: boolean; endDate?: string }) =>
      apiClient.post<ImportVipCsvResult>("/admin/vip/import", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "vip"] }),
  });
}
