import { z } from "zod";

export const createIntentSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(["stripe", "paypal", "apple_pay", "google_pay"]).default("stripe"),
});

export const refundSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.string().max(280).optional(),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateIntentInput = z.infer<typeof createIntentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
