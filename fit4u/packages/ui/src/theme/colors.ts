/**
 * Palette officielle Fit4U by TH — Premium / Noir / Orange / Blanc.
 * Ne jamais coder ces valeurs en dur dans les composants : toujours passer
 * par `useTheme()` (mobile/web) qui résout le bon jeu de couleurs selon le
 * mode actif (Light / Dark / System — Volume 4).
 */

/** Couleurs de marque — identiques quel que soit le thème actif. */
export const brand = {
  orange: "#FF6B00",
  orangeMuted: "#FF8A33",
  orangeDeep: "#CC5500",
  black: "#0A0A0A",
  white: "#FFFFFF",
} as const;

export const semantic = {
  success: "#2ECC71",
  warning: "#F1C40F",
  danger: "#E74C3C",
  info: "#3B9EFF",
} as const;

export interface ColorPalette {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderMuted: string;
  overlay: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const darkPalette: ColorPalette = {
  background: brand.black,
  backgroundElevated: "#121212",
  surface: "#171717",
  surfaceElevated: "#212121",
  primary: brand.orange,
  primaryMuted: brand.orangeMuted,
  onPrimary: brand.white,
  textPrimary: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textTertiary: "#767676",
  border: "#2A2A2A",
  borderMuted: "#1E1E1E",
  overlay: "rgba(0,0,0,0.6)",
  ...semantic,
};

export const lightPalette: ColorPalette = {
  background: "#FFFFFF",
  backgroundElevated: "#F7F7F8",
  surface: "#F2F2F3",
  surfaceElevated: "#FFFFFF",
  primary: brand.orange,
  primaryMuted: brand.orangeMuted,
  onPrimary: brand.white,
  textPrimary: "#0A0A0A",
  textSecondary: "#4B4B4D",
  textTertiary: "#8A8A8E",
  border: "#E4E4E7",
  borderMuted: "#EFEFF1",
  overlay: "rgba(10,10,10,0.5)",
  ...semantic,
};

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedScheme = "light" | "dark";

export function resolvePalette(scheme: ResolvedScheme): ColorPalette {
  return scheme === "dark" ? darkPalette : lightPalette;
}

/** @deprecated Conservé pour compatibilité — préférer `resolvePalette("dark")` ou `useTheme()`. */
export const colors = darkPalette;
export type ColorToken = keyof ColorPalette;
