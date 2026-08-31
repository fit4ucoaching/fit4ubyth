/**
 * Tokens d'animation — durées/easings partagés par Reanimated (mobile) et
 * Framer Motion (web), pour une sensation de mouvement cohérente entre
 * plateformes (Volume 4 : "Objectif 60 FPS").
 */
export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    base: 250,
    slow: 400,
    slower: 600,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1] as const,
    decelerate: [0, 0, 0.2, 1] as const,
    accelerate: [0.4, 0, 1, 1] as const,
    spring: { damping: 18, stiffness: 220, mass: 1 },
  },
} as const;
