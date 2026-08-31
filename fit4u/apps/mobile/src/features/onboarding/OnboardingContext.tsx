import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Brouillon d'onboarding (Volume 4 : "Les données alimentent directement
 * Teddy") — state local transitoire (pas de Zustand ici : rien n'est
 * persisté avant l'étape finale `useCompleteOnboarding`, qui écrit vers
 * `Profile`/`UserPreference` via les endpoints existants du backend).
 */
export interface OnboardingDraft {
  goalType?: string;
  fitnessLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  availableEquipment: string[];
  sessionsPerWeek?: number;
  weightKg?: number;
  heightCm?: number;
  dietaryPreferences: string[];
  notificationsEnabled?: boolean;
}

interface OnboardingContextValue {
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }): JSX.Element {
  const [draft, setDraft] = useState<OnboardingDraft>({ availableEquipment: [], dietaryPreferences: [] });

  const updateDraft = (patch: Partial<OnboardingDraft>): void => setDraft((prev) => ({ ...prev, ...patch }));

  return <OnboardingContext.Provider value={{ draft, updateDraft }}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingDraft(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboardingDraft() doit être utilisé dans <OnboardingProvider>.");
  return ctx;
}
