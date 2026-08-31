/**
 * Détection de sujets sensibles dans un message entrant — Teddy est un coach
 * fitness/nutrition, pas un service de santé mentale. Toute détection de
 * détresse déclenche une redirection vers des ressources d'aide plutôt
 * qu'une tentative de réponse "coaching" inappropriée.
 *
 * Volontairement conservateur (liste de signaux, pas de classification ML) :
 * un faux positif (redirection non nécessaire) est sans conséquence, un faux
 * négatif serait grave.
 */
const DISTRESS_SIGNALS = [
  "envie de mourir", "me faire du mal", "en finir", "suicide",
  "self-harm", "want to die", "hurt myself", "kill myself",
];

export function detectDistressSignal(message: string): boolean {
  const normalized = message.toLowerCase();
  return DISTRESS_SIGNALS.some((signal) => normalized.includes(signal));
}

export const DISTRESS_REDIRECT_MESSAGE = `Je suis avant tout ton coach sportif, et ce que tu
traverses mérite plus que ce que je peux offrir. Si tu es en détresse, contacte le 3114 (numéro
national de prévention du suicide, gratuit, 24h/24) ou un professionnel de confiance. Je reste
là dès que tu veux reparler fitness.`;
