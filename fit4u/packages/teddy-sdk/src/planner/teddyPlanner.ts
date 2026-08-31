import type { PlannedEvent, PlannerConstraints } from "./types";

/**
 * Module Planner (Volume 5) — répartit séances/repas/récupération sur la
 * semaine selon les contraintes utilisateur. Génération déterministe (pas
 * de LLM) : la répartition d'un planning est un problème combinatoire
 * simple qui n'a pas besoin d'un modèle de langage, et doit rester
 * reproductible (même entrée → même planning).
 */
export function buildWeeklyPlan(constraints: PlannerConstraints): PlannedEvent[] {
  const events: PlannedEvent[] = [];

  const workoutDays = constraints.availableDays.slice(0, constraints.sessionsPerWeek);
  const restDays = constraints.availableDays.filter((d) => !workoutDays.includes(d));

  workoutDays.forEach((day, index) => {
    events.push({
      type: "workout",
      dayOfWeek: day,
      time: constraints.preferredWorkoutHours[index % constraints.preferredWorkoutHours.length],
      title: "Séance d'entraînement",
    });
  });

  if (workoutDays.length >= 3 && restDays.length > 0) {
    events.push({ type: "recovery", dayOfWeek: restDays[0]!, title: "Récupération active recommandée" });
  }

  const allDays: PlannerConstraints["availableDays"] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  for (const day of allDays) {
    for (let mealIndex = 0; mealIndex < constraints.mealsPerDay; mealIndex += 1) {
      events.push({ type: "meal", dayOfWeek: day, title: `Repas ${mealIndex + 1}` });
    }
  }

  return events;
}

/** Domain Prompt du module Planner. */
export function buildPlannerDomainPrompt(events: PlannedEvent[]): string {
  const summary = events
    .filter((e) => e.type !== "meal")
    .map((e) => `${e.dayOfWeek} ${e.time ?? ""} — ${e.title}`)
    .join("\n");

  return `Voici le planning calculé pour la semaine :\n${summary}\n
Présente ce planning à l'utilisateur de façon claire et engageante, jour par jour, sans le
récrire différemment de ce qui est calculé ci-dessus (les horaires/jours sont déterministes).`;
}

export * from "./types";
