import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface AdminDashboardStats {
  totalUsers: number;
  newUsers30d: number;
  activeVip: number;
  totalOrders: number;
  totalRevenueCents: number;
  openTickets: number;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiClient.get<AdminDashboardStats>("/admin/dashboard"),
  });
}
