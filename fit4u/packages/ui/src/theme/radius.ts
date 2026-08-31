/** Rayons de bordure — cohérents entre mobile (NativeWind) et web (Tailwind). */
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
