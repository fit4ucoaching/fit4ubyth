export interface UserXpDTO {
  totalXp: number;
  currentLevel: number;
}

export interface BadgeDTO {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  unlockedAt: string;
}

export type ChallengeStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "EXPIRED";

export interface ChallengeDTO {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  userProgress?: number;
  userCompletedAt?: string;
}
