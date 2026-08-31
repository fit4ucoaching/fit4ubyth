import type { NotificationSettingDTO, PrivacySettingsDTO, ProfileDTO, UserPreferencesDTO } from "@fit4u/types";
import { create } from "zustand";

/** Snapshot du profil/préférences pour accès synchronisé (avatar header, etc.) — source de vérité = React Query. */
interface UserState {
  profile: ProfileDTO | null;
  preferences: UserPreferencesDTO | null;
  privacy: PrivacySettingsDTO | null;
  notifications: NotificationSettingDTO[];
  setProfile: (profile: ProfileDTO | null) => void;
  setPreferences: (preferences: UserPreferencesDTO | null) => void;
  setPrivacy: (privacy: PrivacySettingsDTO | null) => void;
  setNotifications: (notifications: NotificationSettingDTO[]) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  preferences: null,
  privacy: null,
  notifications: [],
  setProfile: (profile) => set({ profile }),
  setPreferences: (preferences) => set({ preferences }),
  setPrivacy: (privacy) => set({ privacy }),
  setNotifications: (notifications) => set({ notifications }),
  reset: () => set({ profile: null, preferences: null, privacy: null, notifications: [] }),
}));
