import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface BackupJobRow {
  id: string;
  status: "pending" | "completed" | "failed";
  triggeredAt: string;
  finishedAt: string | null;
}

export function useBackupHistory() {
  return useQuery({
    queryKey: ["admin", "backups", "history"],
    queryFn: () => apiClient.get<BackupJobRow[]>("/admin/backups/history"),
  });
}

export function useTriggerBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post("/admin/backups/trigger"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "backups"] }),
  });
}
