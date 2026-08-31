/**
 * Hiérarchie typographique complète (Volume 4) — Display / H1-H4 / Body /
 * BodySmall / Caption / Button. Toutes les tailles sont pensées pour rester
 * lisibles à l'échelle mobile ; le web applique un facteur d'échelle
 * responsive (voir `apps/web/src/theme`) plutôt que des valeurs dupliquées.
 */
export const fontFamily = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semibold: "Inter-SemiBold",
  bold: "Inter-Bold",
} as const;

export interface TypeScale {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  letterSpacing?: number;
}

export const typography: Record<
  "display" | "h1" | "h2" | "h3" | "h4" | "body" | "bodySmall" | "caption" | "button",
  TypeScale
> = {
  display: { fontSize: 40, lineHeight: 48, fontFamily: fontFamily.bold, letterSpacing: -0.5 },
  h1: { fontSize: 32, lineHeight: 40, fontFamily: fontFamily.bold, letterSpacing: -0.25 },
  h2: { fontSize: 26, lineHeight: 34, fontFamily: fontFamily.bold },
  h3: { fontSize: 22, lineHeight: 28, fontFamily: fontFamily.semibold },
  h4: { fontSize: 18, lineHeight: 24, fontFamily: fontFamily.semibold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular },
  bodySmall: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium, letterSpacing: 0.2 },
  button: { fontSize: 16, lineHeight: 20, fontFamily: fontFamily.semibold, letterSpacing: 0.1 },
};

export type TypographyVariant = keyof typeof typography;
