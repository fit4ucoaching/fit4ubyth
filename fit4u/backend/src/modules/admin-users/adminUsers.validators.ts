import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING", "DELETED"]).optional(),
  sortBy: z.enum(["createdAt", "email"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const changeRoleSchema = z.object({
  roleName: z.enum(["SUPER_ADMIN", "ADMIN", "SUPPORT", "MODERATOR", "NUTRITION", "COACH", "MARKETING", "ANALYST", "USER"]),
});

export const grantPremiumSchema = z.object({
  isPremium: z.boolean(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type GrantPremiumInput = z.infer<typeof grantPremiumSchema>;
