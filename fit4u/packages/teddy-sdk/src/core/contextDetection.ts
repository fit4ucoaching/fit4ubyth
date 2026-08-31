/**
 * Moteur de détection de contexte (Volume 5 : "Détecter objectif, émotion,
 * fatigue, urgence, nutrition, entraînement, blessure déclarée,
 * récupération, motivation. Router automatiquement vers le bon module.").
 * Détection par patterns — déterministe et instantanée, cohérente avec le
 * reste de l'architecture (aucun appel LLM pour un simple routage).
 */
export type DetectedDomain = "coach" | "nutrition" | "recovery" | "motivation" | "analytics" | "planner" | "general";

const DOMAIN_PATTERNS: { domain: DetectedDomain; patterns: RegExp[] }[] = [
  { domain: "recovery", patterns: [/fatigu[ée]/i, /courbatur/i, /mal dormi/i, /épuisé/i, /récupération/i] },
  { domain: "nutrition", patterns: [/calories?/i, /repas/i, /manger/i, /recette/i, /macros?/i, /régime/i, /nutrition/i] },
  { domain: "planner", patterns: [/planifie/i, /planning/i, /organise ma semaine/i, /calendrier/i] },
  { domain: "analytics", patterns: [/progression/i, /résultats?/i, /bilan/i, /rapport/i, /statistiques?/i] },
  { domain: "motivation", patterns: [/motivation/i, /envie d'abandonner/i, /découragé/i, /plus envie/i] },
  { domain: "coach", patterns: [/séance/i, /programme/i, /exercices?/i, /entraînement/i, /musculation/i] },
];

export interface ContextDetectionResult {
  domain: DetectedDomain;
  /** Signal d'urgence détecté (douleur/blessure) — priorité absolue sur le routage normal. */
  urgent: boolean;
}

const URGENCY_PATTERNS = [/douleur/i, /blessure/i, /craquement/i, /je me suis fait mal/i];

export function detectContext(message: string): ContextDetectionResult {
  const urgent = URGENCY_PATTERNS.some((pattern) => pattern.test(message));

  for (const { domain, patterns } of DOMAIN_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(message))) {
      return { domain, urgent };
    }
  }

  return { domain: "general", urgent };
}
