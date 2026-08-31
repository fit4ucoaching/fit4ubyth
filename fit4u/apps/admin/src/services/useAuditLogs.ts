import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface AuditLogRow {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: { before?: unknown; after?: unknown; ipAddress?: string; userAgent?: string } | null;
  createdAt: string;
  admin: { profile: { firstName: string; lastName: string } | null; email: string };
}

export function useAuditLogs(params: { page: number; pageSize: number; action?: string; targetType?: string }) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])),
      );
      return apiClient.get<{ items: AuditLogRow[]; total: number }>(`/admin/audit-logs?${query.toString()}`);
    },
  });
}
