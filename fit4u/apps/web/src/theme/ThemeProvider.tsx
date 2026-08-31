import type { ThemeMode } from "@fit4u/ui";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const THEME_MODE_KEY = "fit4u_theme_mode";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Résout Light/Dark/System (Volume 4) et applique la classe `.theme-{scheme}` sur `<html>`. */
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) ?? "system",
  );
  const [systemScheme, setSystemScheme] = useState(getSystemScheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const listener = (): void => setSystemScheme(getSystemScheme());
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const resolvedScheme = mode === "system" ? systemScheme : mode;

  useEffect(() => {
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${resolvedScheme}`);
  }, [resolvedScheme]);

  const setMode = (next: ThemeMode): void => {
    setModeState(next);
    localStorage.setItem(THEME_MODE_KEY, next);
  };

  const value = useMemo(() => ({ mode, resolvedScheme, setMode }), [mode, resolvedScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() doit être utilisé dans <ThemeProvider>.");
  return ctx;
}
