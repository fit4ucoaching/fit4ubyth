import { z } from "zod";

export const logWeightSchema = z.object({
  weightKg: z.coerce.number().positive().max(500),
  recordedAt: z.coerce.date().default(() => new Date()),
});

export const logMeasurementSchema = z.object({
  bodyPart: z.string().min(1).max(50),
  valueCm: z.coerce.number().positive().max(300),
  recordedAt: z.coerce.date().default(() => new Date()),
});

export const logPhotoSchema = z.object({
  angle: z.enum(["front", "side", "back"]).optional(),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type LogWeightInput = z.infer<typeof logWeightSchema>;
export type LogMeasurementInput = z.infer<typeof logMeasurementSchema>;
