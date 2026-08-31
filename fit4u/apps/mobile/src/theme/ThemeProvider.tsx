import { buildTheme, type Theme, type ThemeMode } from "@fit4u/ui";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import { getStoredThemeMode, setStoredThemeMode } from "./themeStorage";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Résout Light / Dark / System (Volume 4) — "System" suit
 * `useColorScheme()` d'Expo en temps réel (changement de thème OS sans
 * relancer l'app). La préférence explicite de l'utilisateur (`mode`) est
 * persistée via `expo-secure-store` et rechargée au démarrage.
 */
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const systemScheme = useSystemColorScheme() ?? "dark";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    void getStoredThemeMode().then((stored) => {
      if (stored) setModeState(stored);
    });
  }, []);

  const setMode = (next: ThemeMode): void => {
    setModeState(next);
    void setStoredThemeMode(next);
  };

  const resolvedScheme = mode === "system" ? systemScheme : mode;
  const theme = useMemo(() => buildTheme(resolvedScheme), [resolvedScheme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() doit être utilisé à l'intérieur d'un <ThemeProvider>.");
  }
  return ctx;
}
