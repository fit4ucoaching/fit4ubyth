# Memory — Teddy AI Engine

## 3 niveaux (Volume 5)

### Mémoire permanente (`TeddyPermanentMemory`)
Change rarement — définit qui est l'utilisateur. Source : `Profile`,
`UserPreference` (Volume 2) + `AIMemory` pour les champs sans table dédiée
(blessures déclarées, clé `declared_injuries`).

### Mémoire évolutive (`TeddyEvolutiveMemory`)
Change à chaque interaction significative. Source : `WeightHistory`,
`PersonalRecord`, `FavoriteExercise`, `WorkoutSession`, `UserChallenge`
(Volume 2).

**Champs sans source de données actuelle** (transparence, pas de
simplification silencieuse) : `replacedExerciseNames`, `usualWorkoutHours`,
`likedRecipeNames`. Aucune table Volume 2 ne capture ces signaux
aujourd'hui. Proposition : les stocker via `AIMemory` (même mécanisme que
`declared_injuries`) dès que le produit capture l'événement correspondant
(ex. à la confirmation d'un remplacement d'exercice — `ReplaceExerciseScreen`
côté mobile, Volume 4).

### Mémoire conversationnelle (`TeddyConversationalMemory`)
Historique (`AIMessage`) + résumé intelligent (voir ci-dessous).

## Assemblage

`backend/src/ai/memory/teddyMemory.service.ts#buildFullMemory()` est le
SEUL endroit qui assemble les 3 niveaux depuis Prisma. Le SDK reçoit un
objet `TeddyFullMemory` déjà construit — il ne sait jamais d'où viennent ces
données.

## Résumé intelligent (mémoire long terme)

`memory/summarize.ts#generateIntelligentSummary()` condense historique +
mémoire évolutive en 2-4 phrases denses (ex. *"L'utilisateur s'entraîne
principalement le soir, préfère les haltères, évite la course, suit
actuellement un objectif de perte de poids."*). Appelé **périodiquement**
par le backend (ex. tous les 20 messages), jamais à chaque tour — coût/latence.

## Teddy DNA — profil dynamique

`memory/teddyDNA.ts#extractDNAFacts()` extrait les faits durables d'un
échange (préférence, contrainte, horaire) via un appel LLM dédié, à faible
coût (`gpt-4o-mini`, `max_tokens: 250`). Les faits extraits sont destinés à
`AIMemory` — **jamais** à la mémoire permanente issue de sources
structurées (`Profile`), qui reste la source de vérité pour les champs
qu'elle couvre.

Le profil "devient de plus en plus précis" (Volume 5) par accumulation de
ces faits dans `AIMemory`, relus à chaque `buildFullMemory()`.

## Ce qui N'EST PAS dans ce volume

L'appel périodique à `generateIntelligentSummary()` et `extractDNAFacts()`
après chaque échange n'est pas encore câblé dans un job/trigger backend —
les fonctions existent et sont prêtes, l'orchestration de leur exécution
périodique (ex. job BullMQ dédié, ou hook après chaque N messages) est un
point d'intégration à ajouter dans `backend/src/jobs/`.
