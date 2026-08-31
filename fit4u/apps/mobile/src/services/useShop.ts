import { queryKeys } from "@fit4u/api-client";
import type { CartDTO, OrderDTO, ProductDTO } from "@fit4u/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useShopStore } from "../store/shopStore";
import { apiClient } from "./apiClient";

export function useProducts(filters: { categoryId?: string }) {
  return useQuery({
    queryKey: queryKeys.shop.products(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      return apiClient.get<{ items: ProductDTO[]; total: number }>(`/shop/products?${params.toString()}`);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["shop", "product", id],
    queryFn: () => apiClient.get<ProductDTO>(`/shop/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useCart() {
  const setCartItemCount = useShopStore((s) => s.setCartItemCount);
  return useQuery({
    queryKey: queryKeys.shop.cart,
    queryFn: async () => {
      const cart = await apiClient.get<CartDTO>("/shop/cart");
      setCartItemCount(cart.items.reduce((sum, i) => sum + i.quantity, 0));
      return cart;
    },
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; quantity: number }) => apiClient.post("/shop/cart/items", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart }),
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      couponCode?: string;
      shippingAddress: Record<string, string>;
      paymentMethod: string;
    }) => apiClient.post<OrderDTO>("/shop/checkout", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shop.orders });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.shop.orders,
    queryFn: () => apiClient.get<{ items: OrderDTO[] }>("/shop/orders"),
  });
}
