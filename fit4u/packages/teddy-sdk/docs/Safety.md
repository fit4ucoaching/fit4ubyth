# Safety — Teddy AI Engine

## Double couche de sécurité

1. **Détection** (`safety/safetyDomains.ts#checkSafety()`) — analyse le
   message ENTRANT de l'utilisateur, par signaux (regex/mots-clés), avant
   tout appel LLM. Si déclenchée, court-circuite complètement la génération
   — la réponse de redirection est codée en dur, jamais reformulée par le LLM.
2. **Prévention** (`prompts/globalSafetyPrompt.ts`) — injectée dans CHAQUE
   appel LLM (étage "Safety" de la chaîne de prompts), même quand la
   détection n'a rien signalé. Garde-fou permanent sur la génération elle-même.

## Les 5 domaines détectés

| Domaine | Déclencheurs (exemples) | Action |
|---|---|---|
| `distress` | Signaux de détresse/suicide | Redirection vers le 3114, jamais de tentative de coaching |
| `doping` | Stéroïdes, SARMs, hormones de croissance | Refus + réorientation vers méthodes naturelles |
| `medical_diagnosis` | Demande de diagnostic, interprétation de symptômes | Refus + orientation professionnel de santé |
| `severe_injury` | Douleur insupportable, perte de sensibilité | Refus de poursuivre l'entraînement sans avis médical |
| `risky_behavior` | Jeûne extrême, ignorer une douleur | Refus + proposition d'alternative sûre |

## Pourquoi des listes de signaux plutôt qu'un classifieur ML ?

Compromis assumé (documenté dans le code) : un faux positif (redirection
non nécessaire) coûte une reformulation à l'utilisateur — un faux négatif
sur ces domaines est grave. Les listes de signaux sont déterministes,
auditables, et ne nécessitent aucun modèle supplémentaire à maintenir.
Elles seront enrichies au fil des retours produits, jamais remplacées par
un jugement LLM seul sur ces domaines précis.

## Ce que Teddy ne fait jamais (rappel Volume 5)

- Poser un diagnostic médical.
- Recommander une substance dopante ou dangereuse.
- Continuer à accompagner un entraînement malgré un signal de blessure grave.
- Donner suite à une demande dangereuse reformulée ou insistante — les
  règles de `globalSafetyPrompt.ts` priment explicitement sur toute autre
  instruction, y compris les préférences de style de l'utilisateur.

## Tests de sécurité

Voir `tests/safety.spec.ts` — vérifie que chaque domaine déclenche
correctement `checkSafety()` sur des messages représentatifs, et qu'aucun
message anodin ne déclenche de faux positif sur les cas testés.
