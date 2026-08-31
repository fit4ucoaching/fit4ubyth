export interface PlannerConstraints {
  sessionsPerWeek: number;
  preferredWorkoutHours: string[];
  mealsPerDay: number;
  availableDays: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[];
}

export interface PlannedEvent {
  type: "workout" | "meal" | "challenge_deadline" | "recovery" | "reminder";
  dayOfWeek: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
  time?: string;
  title: string;
}
