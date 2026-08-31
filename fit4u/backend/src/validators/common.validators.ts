import { z } from "zod";

/** Schéma de pagination partagé par tous les endpoints `GET /liste` du backend. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Identifiant invalide"),
});

export const cursorQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
