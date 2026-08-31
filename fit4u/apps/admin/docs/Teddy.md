# Teddy (BackOffice) — Control Center & CEO

## Teddy Control Center — construit (revue continue)

Le Master Prompt demandait : éditer le System Prompt et les prompts
métiers, activer/désactiver les modules, tester des prompts, comparer
deux versions, déployer, rollback.

**Décision d'architecture tranchée** (comparaison avec des produits
similaires — Intercom Fin, Zendesk AI, la plupart des plateformes de
chatbot d'entreprise professionnelles) : **Option 1 de la tension
documentée précédemment — overrides en base, repli sur le code**. Jamais
l'option "tout en base" : le pattern observé chez les acteurs matures du
secteur verrouille systématiquement les garde-fous de sécurité/modération
côté plateforme, et laisse le client/admin ajuster uniquement le ton/les
règles métier.

**Ce qui EST éditable** : les Domain Prompts — Coach, Nutrition,
Recovery, Motivation, Analytics, Planner (`PromptOverride`, Domaine 15).
Créer une version (`POST /admin/teddy/prompts`, toujours inactive à la
création), la tester (`POST /admin/teddy/prompts/preview`, appel OpenAI
isolé sans persistance ni impact sur de vrais utilisateurs), la déployer
(`POST /admin/teddy/prompts/{id}/activate` — désactive l'ancienne version
active AVANT d'activer la nouvelle, jamais deux actives simultanément),
rollback (`POST /admin/teddy/prompts/{id}/deactivate` — repli sur la
constante codée, pas de réactivation automatique d'une version
antérieure : choix explicite laissé à l'admin).

**Ce qui N'EST JAMAIS éditable depuis le BackOffice, par choix
délibéré** : `TEDDY_IDENTITY_PROMPT` et `TEDDY_GLOBAL_SAFETY_PROMPT`
restent des constantes TypeScript versionnées par Git. Même un compte
admin compromis ne peut donc jamais désactiver un garde-fou de sécurité
(détresse, dopage, diagnostic médical, blessure grave, comportement à
risque) en modifiant une ligne de base de données — il faudrait un accès
au dépôt de code et une revue de PR.

**Écart assumé par rapport à la proposition initiale** : l'A/B testing
avec split déterministe (`userId % 2` sur deux overrides actifs
simultanément) n'a PAS été construit — le schéma actuel n'autorise
qu'UNE SEULE version active par clé à la fois (contrainte applicative
volontaire, plus simple à raisonner et à auditer). Un vrai A/B test
nécessiterait d'assouplir cette contrainte et d'ajouter un mécanisme de
répartition du trafic, non fait à ce stade — le "tester avant déployer"
(aperçu isolé) couvre le besoin principal sans cette complexité
supplémentaire.

Activer/désactiver un module entier (Coach/Nutrition/...) reste distinct
de ce système : un `FeatureFlag` par module (`teddy_module_coach`, etc.),
déjà supporté par le système de Feature Flags (Volume 6) — non câblé à
`core/buildDomainPrompt.ts` à ce jour (le routage vers un module reste
inconditionnel une fois le domaine détecté).

## Teddy CEO — construit (revue continue)

Assistant IA conversationnel pour l'administrateur — **implémenté**,
distinct de la proposition initiale sur un point important :

- Module `backend/src/ai/ceo/` + `packages/teddy-sdk/src/ceo/` (SDK), même
  séparation stricte outils déclarés (SDK) / exécutés (backend) que
  Volume 5.
- **Ne réutilise PAS** `analytics/teddyAnalytics.ts#detectTrend()` comme
  envisagé initialement — cette fonction est conçue pour l'adhérence d'UN
  utilisateur (`adherenceRate`), sémantiquement incompatible avec des
  métriques plateforme (un revenu global n'a pas de "taux d'adhérence").
  Une fonction dédiée (`ceoAnomalyDetection.ts#detectPlatformAnomalies()`,
  testée unitairement) compare plutôt des paires période courante/
  précédente et signale tout écart au-delà d'un seuil configurable.
- Route `POST /admin/teddy-ceo/chat` (permission `teddy.read`), 4 outils
  réels : `GetKPISummary`, `DetectAnomalies`, `GetChurnRiskUsers`,
  `GetTopPerformingPrograms` — chacun appuyé sur de vraies requêtes Prisma
  (`backend/src/ai/ceo/ceo.repository.ts`), jamais des données simulées.
- Conversations persistées via `AIConversation`/`AIMessage` (Volume 5) —
  un admin est un `User` comme un autre, aucune extension de schéma
  nécessaire pour cette persistance.
- Page BackOffice `apps/admin/src/pages/TeddyCeoPage.tsx` (chat), entrée
  Sidebar distincte de "Teddy" (Control Center — ce dernier reste un gap).

**Limite connue, documentée plutôt que masquée** : l'architecture en 2
phases héritée du Volume 5 ne supporte qu'UN SEUL aller-retour d'appels
d'outils par message — si le modèle voulait enchaîner un outil B selon le
résultat de l'outil A, ce n'est pas possible à ce jour. Un bug de
commentaire trompeur suggérant une "boucle à 3 itérations" a été corrigé
dans `ai.service.ts` à cette occasion (la boucle existante ne s'exécutait
en pratique qu'une fois, `completeTeddyTurn` renvoyant toujours un statut
final). Voir `packages/teddy-sdk/docs/Evolution.md#teddy-ceo` pour le
détail complet de cette limite.

**Non construit** : rapports Daily/Weekly/Monthly automatiques (le CEO
répond à la demande uniquement, aucun push programmé) — réutiliser les
jobs `dailyReport`/`weeklyReport`/`monthlyReport` (Volume 3) pour ce
faire reste une extension possible, non nécessaire pour qu'un membre de
l'équipe interroge Teddy CEO à la demande dès aujourd'hui.
