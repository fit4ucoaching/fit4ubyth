import { type ResolvedScheme, resolvePalette } from "./colors";
import { motion } from "./motion";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { zIndex } from "./zIndex";

/**
 * Thème complet assemblé pour un scheme résolu ("light" | "dark") — jamais
 * "system" ici : la résolution system→light/dark se fait en amont, dans
 * `useTheme()` côté mobile (via `useColorScheme` d'Expo) et côté web (via
 * `prefers-color-scheme` + préférence utilisateur persistée).
 */
export function buildTheme(scheme: ResolvedScheme) {
  return {
    scheme,
    colors: resolvePalette(scheme),
    spacing,
    radius,
    typography,
    shadows,
    motion,
    zIndex,
  } as const;
}

export type Theme = ReturnType<typeof buildTheme>;
