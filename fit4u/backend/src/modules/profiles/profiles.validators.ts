import { z } from "zod";

export const updatePreferencesSchema = z.object({
  measurementSystem: z.enum(["METRIC", "IMPERIAL"]).optional(),
  primaryGoal: z
    .enum([
      "WEIGHT_LOSS",
      "MUSCLE_GAIN",
      "MAINTENANCE",
      "PERFORMANCE",
      "ENDURANCE",
      "HYROX",
      "RUNNING",
      "FOOTBALL",
      "MOBILITY",
    ])
    .optional(),
  preferredEquipment: z
    .array(
      z.enum([
        "BODYWEIGHT",
        "DUMBBELLS",
        "BARBELL",
        "MACHINE",
        "RESISTANCE_BAND",
        "KETTLEBELL",
        "CARDIO",
        "OTHER",
      ]),
    )
    .optional(),
  restDayReminder: z.boolean().optional(),
});

export const updatePrivacySchema = z.object({
  profileVisibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
  showWeightHistory: z.boolean().optional(),
  showInLeaderboards: z.boolean().optional(),
  allowFriendRequests: z.boolean().optional(),
});

export const updateNotificationSchema = z.object({
  type: z.enum(["PUSH", "EMAIL", "IN_APP"]),
  isEnabled: z.boolean(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
