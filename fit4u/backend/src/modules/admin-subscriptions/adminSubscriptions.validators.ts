import { z } from "zod";

export const createPlanSchema = z.object({
  key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  accessLevel: z.enum(["FREE", "PREMIUM", "PRO", "VIP", "ADMIN"]),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createPriceSchema = z.object({
  provider: z.enum(["stripe", "paypal"]),
  providerPriceId: z.string().optional(),
  billingInterval: z.enum(["MONTH", "YEAR"]),
  amountCents: z.coerce.number().int().positive(),
  currency: z.string().length(3).default("EUR"),
});

export const listSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "PAUSED", "CANCELED", "EXPIRED", "INCOMPLETE"]).optional(),
});

export const adminCancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false),
  reason: z.string().max(280).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreatePriceInput = z.infer<typeof createPriceSchema>;
export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsQuerySchema>;
export type AdminCancelSubscriptionInput = z.infer<typeof adminCancelSubscriptionSchema>;
