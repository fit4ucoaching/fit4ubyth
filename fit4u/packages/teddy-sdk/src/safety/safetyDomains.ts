/**
 * Domaines de sécurité IA (Volume 5 : "Toujours refuser dopage, substances
 * dangereuses, conseils médicaux, diagnostics, blessures graves,
 * comportements à risque"). Chaque domaine a ses propres signaux de
 * détection et son propre message de redirection — jamais un unique
 * "je ne peux pas répondre" générique, qui serait moins actionnable pour
 * l'utilisateur.
 *
 * Volontairement fondé sur des listes de signaux (pas de classification ML) :
 * un faux positif (redirection non nécessaire) coûte une reformulation à
 * l'utilisateur ; un faux négatif sur ces sujets est grave. Le compromis est
 * assumé dans ce sens.
 */
export type SafetyDomain = "distress" | "doping" | "medical_diagnosis" | "severe_injury" | "risky_behavior";

interface SafetyRule {
  domain: SafetyDomain;
  signals: string[];
  redirectMessage: string;
}

const DISTRESS_REDIRECT = `Je suis avant tout ton coach sportif, et ce que tu traverses mérite plus
que ce que je peux offrir. Si tu es en détresse, contacte le 3114 (numéro national de prévention du
suicide, gratuit, 24h/24) ou un professionnel de confiance. Je reste là dès que tu veux reparler fitness.`;

const DOPING_REDIRECT = `Je ne peux pas t'accompagner sur les stéroïdes, SARMs, ou autres substances
dopantes/dangereuses — les risques pour ta santé (cardiaques, hormonaux, hépatiques) dépassent largement
le bénéfice sportif. Je peux en revanche t'aider à progresser plus vite avec un programme et une
nutrition optimisés naturellement, ce qui donne de vrais résultats durables.`;

const MEDICAL_DIAGNOSIS_REDIRECT = `Je ne suis pas médecin et je ne peux pas poser de diagnostic ni
interpréter des symptômes précis. Pour ça, un professionnel de santé est indispensable. Je peux
t'aider à adapter ton entraînement une fois que tu as un avis médical, ou en attendant.`;

const SEVERE_INJURY_REDIRECT = `Ce que tu décris mérite d'être vu par un professionnel de santé avant
qu'on continue à s'entraîner sur cette zone. Consulte un médecin ou kinésithérapeute rapidement — je
reste disponible pour adapter ton programme autour de la blessure une fois que tu as leur avis.`;

const RISKY_BEHAVIOR_REDIRECT = `Ce que tu proposes présente un vrai risque pour ta sécurité — je ne
peux pas t'accompagner là-dessus. Parlons plutôt de comment atteindre le même objectif de façon sûre
et durable.`;

const SAFETY_RULES: SafetyRule[] = [
  {
    domain: "distress",
    signals: [
      "envie de mourir", "me faire du mal", "en finir", "suicide",
      "self-harm", "want to die", "hurt myself", "kill myself",
    ],
    redirectMessage: DISTRESS_REDIRECT,
  },
  {
    domain: "doping",
    signals: [
      "stéroïdes", "steroides", "anabolisant", "sarms", "hormone de croissance",
      "clenbuterol", "dianabol", "testostérone injectable", "dopage", "doping", "peptides anabolisants",
    ],
    redirectMessage: DOPING_REDIRECT,
  },
  {
    domain: "medical_diagnosis",
    signals: [
      "qu'est-ce que j'ai", "quel diagnostic", "c'est grave docteur", "ai-je une hernie",
      "est-ce une fracture", "est-ce que c'est cassé", "diagnostique-moi",
    ],
    redirectMessage: MEDICAL_DIAGNOSIS_REDIRECT,
  },
  {
    domain: "severe_injury",
    signals: [
      "douleur insupportable", "je ne peux plus bouger", "craquement suivi de douleur",
      "gonflement important", "perte de sensibilité", "engourdissement",
    ],
    redirectMessage: SEVERE_INJURY_REDIRECT,
  },
  {
    domain: "risky_behavior",
    signals: [
      "jeûne extrême", "ne plus rien manger pendant", "m'entraîner malgré la fracture",
      "ignorer la douleur et continuer", "sans échauffement à charge max",
    ],
    redirectMessage: RISKY_BEHAVIOR_REDIRECT,
  },
];

export interface SafetyCheckResult {
  triggered: boolean;
  domain?: SafetyDomain;
  redirectMessage?: string;
}

/** Vérifie un message entrant contre tous les domaines de sécurité, dans l'ordre de gravité. */
export function checkSafety(message: string): SafetyCheckResult {
  const normalized = message.toLowerCase();

  for (const rule of SAFETY_RULES) {
    if (rule.signals.some((signal) => normalized.includes(signal))) {
      return { triggered: true, domain: rule.domain, redirectMessage: rule.redirectMessage };
    }
  }

  return { triggered: false };
}
