import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planKey: z.string().min(1),
  provider: z.enum(["stripe", "paypal"]),
  billingInterval: z.enum(["MONTH", "YEAR"]),
  couponCode: z.string().optional(),
});

export const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
