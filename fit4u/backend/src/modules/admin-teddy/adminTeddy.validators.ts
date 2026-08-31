import { z } from "zod";

export const promptKeySchema = z.object({
  key: z.enum(["COACH", "NUTRITION", "RECOVERY", "MOTIVATION", "ANALYTICS", "PLANNER"]),
});

export const createPromptVersionSchema = z.object({
  key: z.enum(["COACH", "NUTRITION", "RECOVERY", "MOTIVATION", "ANALYTICS", "PLANNER"]),
  content: z.string().min(10).max(4000),
});

export type PromptKeyParam = z.infer<typeof promptKeySchema>;
export type CreatePromptVersionInput = z.infer<typeof createPromptVersionSchema>;
