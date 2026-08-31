import { z } from "zod";

export const grantVipSchema = z.object({
  email: z.string().email(),
  isLifetime: z.boolean().default(false),
  endDate: z.coerce.date().optional(),
  note: z.string().max(280).optional(),
});

export const createTicketSchema = z.object({
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const replyTicketSchema = z.object({
  content: z.string().min(1).max(2000),
  isInternalNote: z.boolean().default(false),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  assignedTo: z.string().uuid().optional(),
});

export const upsertSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
  description: z.string().optional(),
});

export const importVipCsvSchema = z.object({
  /** Une ligne = un email, une note optionnelle séparée par une virgule (format "email,note"). */
  csvContent: z.string().min(1),
  isLifetime: z.boolean().default(true),
  endDate: z.coerce.date().optional(),
});

export const upsertFeatureFlagSchema = z.object({
  key: z.string().min(1).max(100),
  isEnabled: z.boolean(),
  rolloutPercentage: z.coerce.number().int().min(0).max(100).default(0),
  description: z.string().optional(),
  targetAudience: z.enum(["ALL", "PREMIUM", "VIP", "BETA"]).default("ALL"),
  targetCountries: z.array(z.string().length(2)).default([]),
  targetMinVersion: z.string().optional(),
  isBeta: z.boolean().default(false),
});

export type GrantVipInput = z.infer<typeof grantVipSchema>;
export type ImportVipCsvInput = z.infer<typeof importVipCsvSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
export type UpsertFeatureFlagInput = z.infer<typeof upsertFeatureFlagSchema>;
