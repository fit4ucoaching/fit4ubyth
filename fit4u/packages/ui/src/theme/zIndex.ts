/** Ordre d'empilement centralisé — évite les guerres de z-index arbitraires. */
export const zIndex = {
  base: 0,
  card: 10,
  stickyHeader: 20,
  bottomTabs: 30,
  drawer: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export type ZIndexToken = keyof typeof zIndex;
