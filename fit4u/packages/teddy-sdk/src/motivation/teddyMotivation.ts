/**
 * Module Motivation (Volume 5) — adapte le TON selon régularité/niveau/
 * historique. "Débutant → encouragements fréquents. Utilisateur avancé →
 * feedback plus technique." Le ton est calculé déterministiquement, le
 * contenu du message reste généré par le LLM avec cette instruction de ton
 * injectée dans le Domain Prompt.
 */
export type MotivationTone = "frequent_encouragement" | "technical_feedback" | "gentle_relaunch" | "celebratory";

export interface MotivationInput {
  fitnessLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  daysSinceLastActivity: number;
  adherenceRate: number; // 0-1
  justAchievedGoal?: boolean;
}

export function computeMotivationTone(input: MotivationInput): MotivationTone {
  if (input.justAchievedGoal) return "celebratory";
  if (input.daysSinceLastActivity >= 5) return "gentle_relaunch";
  if (input.fitnessLevel === "BEGINNER" || input.adherenceRate < 0.5) return "frequent_encouragement";
  return "technical_feedback";
}

const TONE_INSTRUCTIONS: Record<MotivationTone, string> = {
  frequent_encouragement: "Encourage fréquemment, célèbre chaque petite victoire, reste très accessible et positif — évite le jargon technique.",
  technical_feedback: "Donne un feedback précis et technique, traite l'utilisateur comme un pratiquant expérimenté qui n'a pas besoin d'être rassuré à chaque étape.",
  gentle_relaunch: "Relance en douceur sans culpabiliser — reconnais l'absence sans la commenter négativement, propose un point de reprise facile et motivant.",
  celebratory: "Célèbre sincèrement et chaleureusement cette réussite avant toute autre chose.",
};

/** Domain Prompt du module Motivation. */
export function buildMotivationDomainPrompt(input: MotivationInput): string {
  const tone = computeMotivationTone(input);
  return `Ton à adopter pour cette réponse : ${TONE_INSTRUCTIONS[tone]}`;
}

/** Génère un message quotidien type (voir Teddy Daily) sans appel LLM — utilisé en repli si la génération échoue. */
export function buildFallbackDailyMessage(firstName: string): string {
  return `Bonjour ${firstName} 👋 Prêt(e) pour une nouvelle journée ? Teddy est là pour t'accompagner.`;
}
