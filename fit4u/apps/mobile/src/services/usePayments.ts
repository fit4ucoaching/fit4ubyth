import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "./apiClient";

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (input: { orderId: string; provider: "stripe" | "paypal" | "apple_pay" | "google_pay" }) =>
      apiClient.post<{ clientSecret?: string; paypalOrderId?: string; provider: string }>(
        "/payments/create-intent",
        input,
      ),
  });
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: ["payments", "history"],
    queryFn: () => apiClient.get("/payments/history"),
  });
}
