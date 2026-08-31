import { create } from "zustand";

/** État client de la journée nutrition en cours — le journal complet reste côté serveur (React Query). */
interface NutritionState {
  todayWaterMl: number;
  dailyWaterGoalMl: number;
  draftMealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null;
  setTodayWaterMl: (amountMl: number) => void;
  incrementWater: (amountMl: number) => void;
  setDailyWaterGoal: (goalMl: number) => void;
  setDraftMealType: (type: NutritionState["draftMealType"]) => void;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  todayWaterMl: 0,
  dailyWaterGoalMl: 2000,
  draftMealType: null,
  setTodayWaterMl: (todayWaterMl) => set({ todayWaterMl }),
  incrementWater: (amountMl) => set((s) => ({ todayWaterMl: s.todayWaterMl + amountMl })),
  setDailyWaterGoal: (dailyWaterGoalMl) => set({ dailyWaterGoalMl }),
  setDraftMealType: (draftMealType) => set({ draftMealType }),
}));
