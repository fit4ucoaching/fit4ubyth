/**
 * Niveaux d'accès (Volume 7 §4) — 5 paliers minimum, priorité configurable
 * (§12 : "Cette priorité doit être configurable"). L'ordre du tableau EST
 * la configuration : `ADMIN` en premier = priorité maximale. Modifier cet
 * ordre change le comportement de tout le système sans toucher au reste du
 * code — c'est le seul endroit où la hiérarchie est déclarée.
 */
export const ACCESS_LEVEL_PRIORITY = ["ADMIN", "VIP", "PRO", "PREMIUM", "FREE"] as const;

export type AccessLevel = (typeof ACCESS_LEVEL_PRIORITY)[number];

/** `level` satisfait-il au moins `minimum` ? (ex. ADMIN satisfait toujours PREMIUM). */
export function isAtLeast(level: AccessLevel, minimum: AccessLevel): boolean {
  return ACCESS_LEVEL_PRIORITY.indexOf(level) <= ACCESS_LEVEL_PRIORITY.indexOf(minimum);
}
