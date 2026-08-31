export type UserRoleName =
  | "USER" | "COACH" | "ADMIN" | "SUPER_ADMIN"
  | "SUPPORT" | "MODERATOR" | "NUTRITION" | "MARKETING" | "ANALYST";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type SubscriptionType = "FREE" | "PREMIUM" | "PRO" | "VIP";
export type MeasurementSystem = "METRIC" | "IMPERIAL";

/**
 * DTO utilisateur consommé par le frontend — reflète le contrat réel du
 * backend Volume 3 (rôles dynamiques, statut, résolution VIP), et non plus
 * le `User` plat simplifié du Volume 1 (voir docs/BACKEND_ARCHITECTURE.md §8,
 * point d'extension résolu au Volume 4).
 */
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRoleName[];
  /** Résolues depuis les rôles à l'émission du token (Volume 6 RBAC). */
  permissions?: string[];
  isPremium: boolean;
  status: UserStatus;
  locale: string;
  avatarUrl?: string;
}

export interface ProfileDTO {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  gender?: Gender;
  birthDate?: string;
  heightCm?: number;
  country?: string;
  isPremium: boolean;
  subscription: SubscriptionType;
}

export interface UserPreferencesDTO {
  measurementSystem: MeasurementSystem;
  primaryGoal?: string;
  preferredEquipment: string[];
  restDayReminder: boolean;
}

export interface PrivacySettingsDTO {
  profileVisibility: "PUBLIC" | "FRIENDS" | "PRIVATE";
  showWeightHistory: boolean;
  showInLeaderboards: boolean;
  allowFriendRequests: boolean;
}

export interface NotificationSettingDTO {
  type: "PUSH" | "EMAIL" | "IN_APP";
  isEnabled: boolean;
}
