import type { ThemeMode } from "@fit4u/ui";
import * as SecureStore from "expo-secure-store";

const THEME_MODE_KEY = "fit4u_theme_mode";

export async function getStoredThemeMode(): Promise<ThemeMode | null> {
  const value = await SecureStore.getItemAsync(THEME_MODE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

export async function setStoredThemeMode(mode: ThemeMode): Promise<void> {
  await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
}
