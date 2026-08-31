import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});

export const toggleProductActiveSchema = z.object({
  isActive: z.boolean(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ToggleProductActiveInput = z.infer<typeof toggleProductActiveSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
