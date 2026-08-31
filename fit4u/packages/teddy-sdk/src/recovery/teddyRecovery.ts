/**
 * Module Recovery (Volume 5) — analyse sommeil/fatigue/fréquence/charge et
 * décide : séance normale, légère, récupération active, ou repos. Décision
 * déterministe (règles), pas un jugement LLM — la sortie alimente ensuite
 * `coach/adaptation.ts` via `CoachContext.recoveryStatus`.
 */
export type RecoveryDecision = "normal" | "light" | "active_recovery" | "rest";

export interface RecoveryInput {
  /** Séances complétées sur les 7 derniers jours. */
  recentSessionsCount: number;
  /** Jours écoulés depuis la dernière séance de repos complet. */
  daysSinceLastRest: number;
  /** Auto-évaluation optionnelle de fatigue (1 = frais, 5 = épuisé) — si fournie par l'utilisateur. */
  selfReportedFatigue?: 1 | 2 | 3 | 4 | 5;
  /** Charge d'entraînement récente vs habituelle (ratio > 1 = charge inhabituellement élevée). */
  acuteToChronicWorkloadRatio?: number;
}

export function decideRecovery(input: RecoveryInput): { decision: RecoveryDecision; reason: string } {
  if (input.selfReportedFatigue === 5) {
    return { decision: "rest", reason: "Fatigue déclarée maximale — repos complet recommandé." };
  }
  if (input.daysSinceLastRest >= 6) {
    return { decision: "rest", reason: "Aucun jour de repos depuis 6 jours ou plus — risque de surentraînement." };
  }
  if (input.acuteToChronicWorkloadRatio && input.acuteToChronicWorkloadRatio > 1.5) {
    return { decision: "active_recovery", reason: "Charge d'entraînement récente nettement supérieure à l'habitude." };
  }
  if (input.selfReportedFatigue && input.selfReportedFatigue >= 4) {
    return { decision: "light", reason: "Fatigue déclarée élevée — séance allégée recommandée." };
  }
  if (input.recentSessionsCount >= 5 && input.daysSinceLastRest >= 4) {
    return { decision: "light", reason: "Fréquence d'entraînement élevée cette semaine sans repos récent." };
  }
  return { decision: "normal", reason: "Aucun signal de fatigue significatif détecté." };
}

/** Domain Prompt du module Recovery — utilisé quand l'utilisateur pose une question directe sur sa récupération. */
export function buildRecoveryDomainPrompt(input: RecoveryInput): string {
  const { decision, reason } = decideRecovery(input);
  return `L'analyse de récupération recommande : "${decision}". Raison : ${reason}
Explique cette recommandation à l'utilisateur de façon motivante, sans culpabiliser, en insistant
sur le fait que la récupération fait partie intégrante de la progression.`;
}
