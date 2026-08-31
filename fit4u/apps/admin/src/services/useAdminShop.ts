import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export interface ProductRow {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
  category: { name: string };
}

export interface OrderRow {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  shopifyOrderId: string | null;
  user: { email: string; profile: { firstName: string; lastName: string } | null };
  items: { quantity: number; product: { name: string } }[];
}

export function useProductsList(params: { page: number; pageSize: number; q?: string }) {
  return useQuery({
    queryKey: ["admin", "shop", "products", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.q ? { q: params.q } : {}) });
      return apiClient.get<{ items: ProductRow[]; total: number }>(`/admin/shop/products?${query.toString()}`);
    },
  });
}

export function useToggleProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.put(`/admin/shop/products/${id}/active`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "shop", "products"] }),
  });
}

export function useOrdersList(params: { page: number; pageSize: number; status?: string }) {
  return useQuery({
    queryKey: ["admin", "shop", "orders", params],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.status ? { status: params.status } : {}) });
      return apiClient.get<{ items: OrderRow[]; total: number }>(`/admin/shop/orders?${query.toString()}`);
    },
  });
}

export function useSyncShopify() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<{ syncedCount: number }>("/admin/shop/sync", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "shop", "products"] }),
  });
}
