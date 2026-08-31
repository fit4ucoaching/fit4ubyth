export type ReportPeriod = "daily" | "weekly" | "monthly" | "annual";

export interface AnalyticsSnapshot {
  period: ReportPeriod;
  workoutsCompleted: number;
  totalCaloriesBurned: number;
  weightChangeKg?: number;
  personalRecordsCount: number;
  adherenceRate: number; // 0-1
  previousPeriodComparison?: {
    workoutsCompleted: number;
    weightChangeKg?: number;
  };
}
