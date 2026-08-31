import type { WorkoutExerciseDTO } from "@fit4u/types";
import { create } from "zustand";

export type WorkoutPhase = "idle" | "exercising" | "resting" | "finished";

/**
 * État LIVE d'une séance en cours (Volume 4 — "grand chronomètre, repos
 * automatique, remplacement d'exercice"). Purement client/éphémère : rien
 * ici n'est persisté en base tant que `finish()` n'est pas appelé (via
 * `services/useWorkouts.ts`, React Query) — cette séparation stricte évite
 * toute divergence entre "ce que l'utilisateur voit en live" et "ce qui est
 * confirmé côté serveur".
 */
interface WorkoutState {
  workoutSessionId: string | null;
  phase: WorkoutPhase;
  exercises: WorkoutExerciseDTO[];
  currentExerciseIndex: number;
  elapsedSeconds: number;
  restRemainingSeconds: number;
  startSession: (workoutSessionId: string, exercises: WorkoutExerciseDTO[]) => void;
  tickElapsed: () => void;
  startRest: (durationSeconds: number) => void;
  tickRest: () => void;
  completeCurrentExercise: (result: Partial<WorkoutExerciseDTO>) => void;
  goToNextExercise: () => void;
  replaceCurrentExercise: (exercise: WorkoutExerciseDTO) => void;
  finish: () => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workoutSessionId: null,
  phase: "idle",
  exercises: [],
  currentExerciseIndex: 0,
  elapsedSeconds: 0,
  restRemainingSeconds: 0,

  startSession: (workoutSessionId, exercises) =>
    set({ workoutSessionId, exercises, phase: "exercising", currentExerciseIndex: 0, elapsedSeconds: 0 }),

  tickElapsed: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),

  startRest: (durationSeconds) => set({ phase: "resting", restRemainingSeconds: durationSeconds }),

  tickRest: () => {
    const remaining = get().restRemainingSeconds - 1;
    if (remaining <= 0) {
      set({ phase: "exercising", restRemainingSeconds: 0 });
    } else {
      set({ restRemainingSeconds: remaining });
    }
  },

  completeCurrentExercise: (result) =>
    set((s) => ({
      exercises: s.exercises.map((ex, i) =>
        i === s.currentExerciseIndex ? { ...ex, ...result, isCompleted: true } : ex,
      ),
    })),

  goToNextExercise: () =>
    set((s) => ({
      currentExerciseIndex: Math.min(s.currentExerciseIndex + 1, s.exercises.length - 1),
      phase: "exercising",
    })),

  replaceCurrentExercise: (exercise) =>
    set((s) => ({
      exercises: s.exercises.map((ex, i) => (i === s.currentExerciseIndex ? exercise : ex)),
    })),

  finish: () => set({ phase: "finished" }),

  reset: () =>
    set({
      workoutSessionId: null,
      phase: "idle",
      exercises: [],
      currentExerciseIndex: 0,
      elapsedSeconds: 0,
      restRemainingSeconds: 0,
    }),
}));
