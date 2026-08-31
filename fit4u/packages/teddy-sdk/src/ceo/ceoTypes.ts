export interface PlatformKPISummary {
  totalUsers: number;
  newUsers30d: number;
  activeVip: number;
  activeSubscriptions: number;
  mrrCents: number;
  totalRevenueCents30d: number;
  openSupportTickets: number;
}

export interface ChurnRiskUser {
  userId: string;
  email: string;
  daysSinceLastActivity: number;
  subscriptionStatus: string;
}

export interface TopProgram {
  programId: string;
  programName: string;
  completedSessionsCount: number;
}
