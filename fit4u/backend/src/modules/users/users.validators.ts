import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(280).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  birthDate: z.coerce.date().optional(),
  heightCm: z.coerce.number().positive().max(300).optional(),
  country: z.string().length(2).optional(),
  locale: z.enum(["fr", "en", "es", "de", "it", "pt"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
