import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface PaymentsOverview {
  mrrCents: number;
  arrCents: number;
  activeVip: number;
  activeSubscriptionsCount: number;
  conversionRate: number;
  last30Days: { succeededCount: number; succeededAmountCents: number; failedCount: number; refundedCount: number; refundedAmountCents: number; totalUsers: number };
  subscriptionBreakdown: { subscription: string; count: number }[];
}

export function usePaymentsOverview() {
  return useQuery({
    queryKey: ["admin", "payments", "overview"],
    queryFn: () => apiClient.get<PaymentsOverview>("/admin/payments/overview"),
  });
}

export function useAdminPaymentsList(params: { page: number; pageSize: number; status?: string }) {
  return useQuery({
    queryKey: ["admin", "payments", "list", params],
    queryFn: () => {
      const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])));
      return apiClient.get(`/admin/payments?${query.toString()}`);
    },
  });
}
