import { z } from "zod";

export const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "REVIEWED", "DISMISSED", "ACTIONED"]).optional(),
});

export const reviewReportSchema = z.object({
  status: z.enum(["DISMISSED", "ACTIONED"]),
});

export const createBanSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  expiresAt: z.coerce.date().optional(),
});

export const listBansQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  activeOnly: z.coerce.boolean().default(false),
});

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
export type CreateBanInput = z.infer<typeof createBanSchema>;
export type ListBansQuery = z.infer<typeof listBansQuerySchema>;
