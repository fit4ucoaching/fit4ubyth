/**
 * Élévations — exprimées de façon cross-platform (offset/radius/opacity),
 * traduites en `boxShadow` CSS côté web et en `shadow*`/`elevation` côté
 * React Native par les couches d'application respectives.
 */
export interface Shadow {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  opacity: number;
  elevation: number; // Android
}

export const shadows: Record<"none" | "sm" | "md" | "lg" | "xl", Shadow> = {
  none: { offsetX: 0, offsetY: 0, blurRadius: 0, opacity: 0, elevation: 0 },
  sm: { offsetX: 0, offsetY: 1, blurRadius: 3, opacity: 0.12, elevation: 2 },
  md: { offsetX: 0, offsetY: 4, blurRadius: 10, opacity: 0.16, elevation: 4 },
  lg: { offsetX: 0, offsetY: 8, blurRadius: 20, opacity: 0.2, elevation: 8 },
  xl: { offsetX: 0, offsetY: 16, blurRadius: 32, opacity: 0.24, elevation: 16 },
};

export type ShadowToken = keyof typeof shadows;
