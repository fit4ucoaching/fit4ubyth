import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface SubscriptionPriceRow {
  id: string;
  provider: string;
  billingInterval: string;
  amountCents: number;
  currency: string;
  isActive: boolean;
}

export interface SubscriptionPlanRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  accessLevel: "FREE" | "PREMIUM" | "PRO" | "VIP" | "ADMIN";
  isActive: boolean;
  prices: SubscriptionPriceRow[];
}

export interface SubscriptionRow {
  id: string;
  status: string;
  provider: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  user: { email: string; profile: { firstName: string; lastName: string } | null };
  plan: { name: string };
}

export function usePlansList() {
  return useQuery({
    queryKey: ["admin", "subscriptions", "plans"],
    queryFn: () => apiClient.get<SubscriptionPlanRow[]>("/admin/subscriptions/plans"),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { key: string; name: string; accessLevel: string; description?: string }) =>
      apiClient.post<SubscriptionPlanRow>("/admin/subscriptions/plans", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions", "plans"] }),
  });
}

export function useTogglePlanActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.put(`/admin/subscriptions/plans/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions", "plans"] }),
  });
}

export function useAddPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, ...input }: { planId: string; provider: string; billingInterval: string; amountCents: number; currency: string }) =>
      apiClient.post(`/admin/subscriptions/plans/${planId}/prices`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions", "plans"] }),
  });
}

export function useSubscriptionsList(params: { page: number; pageSize: number; status?: string }) {
  return useQuery({
    queryKey: ["admin", "subscriptions", "list", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.status ? { status: params.status } : {}) });
      return apiClient.get<{ items: SubscriptionRow[]; total: number }>(`/admin/subscriptions?${query.toString()}`);
    },
  });
}

export function useAdminCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, immediately, reason }: { id: string; immediately: boolean; reason?: string }) =>
      apiClient.post(`/admin/subscriptions/${id}/cancel`, { immediately, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions", "list"] }),
  });
}
