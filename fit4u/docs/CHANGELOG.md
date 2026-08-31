# Changelog — Fit4U by TH

## [0.8.7] — Revue continue (7) : Analytics BI — dernier gap comblé

Dernier gap du BackOffice — décision explicitement demandée : "fais ce
qui te semble le plus judicieux comparé aux autres applications de ce
type". Comparaison retenue : Stripe Dashboard, Shopify Admin, Linear,
Vercel (déjà nos références de conception BackOffice depuis le Volume 6).

- **Décision d'architecture** : jamais un constructeur de requêtes BI
  générique auto-service (filtres multi-dimensionnels arbitraires) —
  sur-ingénierie non justifiée à ce stade (Volume 8 §22 : ne jamais
  construire une infrastructure disproportionnée par rapport au besoin
  réel). Un jeu de **graphiques curés**, comme le font tous les produits
  de référence cités.
- **Nouveau module `admin-analytics`** : 7 endpoints réels appuyés sur de
  vraies agrégations SQL (`$queryRaw` avec `date_trunc` pour les séries
  temporelles) — croissance utilisateurs, revenu Boutique quotidien,
  engagement entraînement, usage Teddy, rétention J7 par cohorte
  hebdomadaire, top exercices, top programmes (ce dernier réutilise
  `CeoRepository.getTopPerformingPrograms` plutôt que de dupliquer la
  requête).
- **Page BackOffice `AnalyticsPage`** — graphiques Recharts (déjà une
  dépendance du projet), toutes les données réelles, aucune donnée
  d'exemple.
- 🐛 **Bug corrigé au passage** : `DashboardPage` (Volume 4) affichait un
  graphique "Activité de la semaine" avec un tableau codé en dur
  (toujours à zéro) plutôt qu'une vraie donnée — remplacé par un appel
  réel à `/admin/analytics/workout-engagement`.
- Tests : normalisation bigint/Date → number/ISO (Postgres renvoie des
  `bigint` non sérialisables tels quels), calcul du taux de rétention
  (jamais de division par zéro), réutilisation confirmée de
  `CeoRepository` plutôt qu'une duplication.
- Documentation mise à jour : **les 19 sections du BackOffice sont
  désormais toutes connectées à un vrai endpoint** — aucun gap restant
  dans `apps/admin/docs/Modules.md`.

## [0.8.6] — Revue continue (6) : Teddy Control Center — tension d'architecture tranchée

Dernier gap majeur du BackOffice (hors Analytics BI) — décision explicitement
demandée : "fais ce qui te semble le plus judicieux comparé aux autres
applications de ce type". Comparaison retenue : Intercom Fin, Zendesk AI,
plateformes de chatbot d'entreprise — pattern hybride quasi-universel dans
ce secteur, jamais "tout en base".

- **Nouveau Domaine 15** (schéma Prisma) : `PromptOverride` (clé, contenu,
  version, statut actif, créateur) — une seule version active par clé à
  la fois, appliqué au niveau service.
- **SDK** : `initiateTeddyTurn` accepte un override par domaine détecté,
  avec repli automatique sur la constante TypeScript codée en dur si
  absent. **Identité et sécurité globale (`TEDDY_IDENTITY_PROMPT`,
  `TEDDY_GLOBAL_SAFETY_PROMPT`) restent des constantes intouchables**,
  jamais exposées à ce mécanisme — vérifié par test explicite (un override
  actif ne réduit jamais la longueur/contenu du prompt de sécurité injecté).
- **Backend** : repository + service (garantit désactivation AVANT
  activation, jamais deux versions actives simultanément), endpoints
  CRUD + un endpoint d'**aperçu** (teste un prompt candidat sur un
  message d'exemple via un appel OpenAI isolé, sans persistance ni
  impact sur un vrai utilisateur).
- **Frontend** : page `TeddyControlCenterPage` — sélecteur de domaine,
  version active affichée, éditeur de nouvelle version, aperçu en direct,
  historique complet avec déploiement/rollback en un clic.
- **Écart assumé documenté** : l'A/B testing avec split de trafic
  (proposé initialement) n'a pas été construit — le schéma n'autorise
  qu'une version active à la fois, choix plus simple à auditer. Le
  "tester avant déployer" (aperçu isolé) couvre le besoin principal.
- Tests : SDK (l'override s'applique au bon domaine, jamais à un autre ;
  repli sur la constante si absent ; identité/sécurité toujours présentes
  malgré un override actif) et backend (séquencement désactivation→
  activation, absence d'activation automatique à la création).
- Documentation mise à jour : **18 modules BackOffice** connectés à un
  vrai endpoint (contre 17 précédemment) — **1 seul gap restant, Analytics
  BI complet**, qui nécessite un vrai moteur de requêtes multi-dimensionnel
  plutôt qu'une extension ponctuelle.

## [0.8.5] — Revue continue (5) : Teddy CEO

- **Nouveau module Teddy CEO** — assistant IA conversationnel pour
  l'équipe (`packages/teddy-sdk/src/ceo/` + `backend/src/ai/ceo/`),
  persona et prompts strictement distincts du coach utilisateur (jamais
  de mélange). 4 outils réels appuyés sur de vraies requêtes Prisma :
  `GetKPISummary`, `DetectAnomalies`, `GetChurnRiskUsers`,
  `GetTopPerformingPrograms`. Endpoint `POST /admin/teddy-ceo/chat`
  (permission `teddy.read`), conversations persistées via
  `AIConversation`/`AIMessage` existants (aucune extension de schéma —
  un admin est un `User` comme un autre). Page BackOffice `TeddyCeoPage`
  avec entrée Sidebar dédiée, distincte de "Teddy" (Control Center,
  qui reste un gap).
- **Décision d'architecture documentée** : `detectTrend()` du SDK
  (Volume 5, conçu pour l'adhérence d'un utilisateur individuel) n'a pas
  été réutilisé pour les anomalies plateforme — sémantiquement
  incompatible. Fonction dédiée `detectPlatformAnomalies()` à la place,
  testée unitairement (comparaison de périodes, seuil configurable).
- 🐛 **Bug latent trouvé et corrigé** : la boucle d'exécution d'outils de
  `ai.service.ts` (Volume 5) prétendait supporter plusieurs itérations
  d'appels d'outils (commentaire "le LLM peut demander plusieurs outils
  avant de répondre") mais ne pouvait structurellement en exécuter
  qu'une seule — `completeTeddyTurn` renvoie toujours un statut final,
  jamais un nouveau `requires_tools`. Commentaire corrigé pour refléter
  la limite réelle plutôt que de la laisser induire en erreur un futur
  lecteur du code. Limite documentée explicitement dans
  `packages/teddy-sdk/docs/Evolution.md` et `apps/admin/docs/Teddy.md`.
- Tests : détection d'anomalies (hausse/baisse/seuil/division par
  zéro/métriques multiples), exécuteur d'outils CEO (dispatch, valeurs
  par défaut, outil inconnu géré proprement).
- Documentation mise à jour : **17 modules BackOffice** connectés à un
  vrai endpoint (contre 16 précédemment), 2 gaps restants (Teddy Control
  Center, Analytics BI complet) — les deux nécessitant une refonte plus
  large qu'une extension ponctuelle (respectivement : stockage de prompts
  éditable en base, vrai moteur de requêtes BI multi-dimensionnel).

## [0.8.4] — Revue continue (4) : Modération Communauté

- **Nouveau Domaine 14** (schéma Prisma) : `Report` (signalements
  polymorphes Post/Comment/User) et `CommunityBan` (bannissement ciblé
  posts/commentaires, distinct d'une suspension de compte complète,
  `expiresAt` null = permanent).
- **Application réelle du bannissement** (Security Engineer) : middleware
  `requireNotBanned`, vérifié fraîchement à chaque publication (même
  raisonnement que `requireFeature()`, Volume 7 — jamais mis en cache JWT),
  câblé sur les routes `POST /posts` et `POST /comments`.
- **Module admin-community** : liste et traitement des signalements
  (`DISMISSED` ou `ACTIONED` — ce dernier retire réellement le contenu via
  soft delete, jamais un simple changement de statut visuel), octroi/levée
  de bannissements. Page BackOffice `CommunityPage` remplaçant le
  `ComingSoonPage`.
- Tests : sécurité du middleware (bloque/laisse passer selon l'état réel du
  bannissement, distingue temporaire/permanent), service de modération
  (vérifie que POST vs COMMENT retirent le bon contenu, que DISMISSED ne
  retire jamais rien).
- Documentation mise à jour : **16 modules BackOffice** connectés à un vrai
  endpoint (contre 15 précédemment), 3 gaps restants (Teddy Control
  Center, Analytics BI complet, Teddy CEO) — tous nécessitant une décision
  produit ou un effort de refonte plus large que les précédents.

## [0.8.3] — Revue continue (3) : Boutique BackOffice

- **Module Boutique BackOffice** (gap Volume 6 partiellement fermé) :
  nouveau module backend `admin-shop` — catalogue en **lecture seule**
  (Shopify reste la source de vérité, Volume 7 §32 : aucune création/édition
  manuelle de produit qui entrerait en conflit avec la synchronisation),
  bascule de **visibilité locale** (`isActive`, un flag propre à Fit4U sans
  équivalent côté Shopify), liste et détail de toutes les commandes.
  Réutilise `POST /admin/shop/sync` (Volume 7) déjà existant plutôt que de
  le dupliquer. Page BackOffice `ShopPage` (onglets Produits/Commandes)
  remplaçant le `ComingSoonPage`.
- Décision d'architecture documentée explicitement (Software Architect) :
  pourquoi ce module n'expose PAS de création/édition de produit, par
  contraste avec Nutrition — la source de vérité diffère (Shopify vs
  interne à Fit4U), donc la même ambition de CRUD complet aurait été un
  anti-pattern ici.
- Tests du nouveau service (vérifie que la bascule ne touche jamais un
  champ synchronisé depuis Shopify).
- Documentation mise à jour : 15 modules BackOffice connectés à un vrai
  endpoint (contre 14 précédemment), 4 gaps restants (Teddy Control
  Center, Communauté, Analytics BI, Teddy CEO).

## [0.8.2] — Revue continue (2) : CMS Nutrition

- **Module Nutrition BackOffice** (gap Volume 6 fermé) : nouveau module
  backend `admin-nutrition` — CRUD complet sur les aliments (créer/modifier/
  archiver, jamais de suppression physique) et création de recettes avec
  ingrédients composés ; toute écriture journalisée (`auditLogService`).
  Page BackOffice `NutritionPage` (onglets Aliments/Recettes) remplaçant le
  `ComingSoonPage`.
- Tests du nouveau service (garde 404 sur les écritures, confirmation que
  l'archivage ne supprime jamais physiquement une ligne).
- Documentation (`apps/admin/docs/Modules.md`) mise à jour : 14 modules
  BackOffice désormais connectés à un vrai endpoint (contre 12
  précédemment), 5 gaps restants clairement délimités (Teddy Control
  Center, Boutique — catalogue/commandes, Communauté, Analytics BI, Teddy CEO).

## [0.8.1] — Revue continue post-Volume 8 (équipe pluridisciplinaire)

Cycle de revue mené comme une équipe senior complète (CTO, Architecte,
Backend/Frontend/Database/Sécurité/QA) sur l'ensemble déjà livré, plutôt
qu'un nouveau volume — objectif : détecter et corriger la dette technique
réelle avant toute autre extension.

- **Module Abonnements BackOffice** (gap Volume 6 resté stale après le
  Volume 7) : le backend d'abonnements existait intégralement depuis le
  Volume 7 mais aucune gestion admin n'avait jamais été construite —
  nouveau module `admin-subscriptions` complet (catalogue d'offres,
  prix, liste de tous les abonnements, annulation admin passant
  réellement par le `PaymentProvider`) + page BackOffice associée,
  remplaçant le `ComingSoonPage`.
- **Correction d'un gap de modélisation découvert en cours de revue** :
  `Subscription` ne référençait aucun `SubscriptionPrice` précis, rendant
  tout calcul de MRR exact structurellement impossible. Ajout de
  `Subscription.priceId` (nullable, `SetNull`) et câblage dans
  `SubscriptionsService.create()`.
- **MRR recalculé pour de vrai** : `adminPayments` sommait auparavant les
  paiements Boutique des 30 derniers jours (mélangeant à tort achats
  ponctuels et abonnements récurrents, Volume 7 §40) ; calcule désormais
  la somme réelle des `SubscriptionPrice` des abonnements actifs,
  normalisée au mois pour les abonnements annuels — logique extraite en
  fonction pure testée unitairement (`mrrCalculation.ts`).
- Tests ajoutés : `admin-subscriptions` (ordre d'appel provider→base sur
  l'annulation), `mrrCalculation` (normalisation mensuelle/annuelle,
  exclusion propre des abonnements sans prix lié).
- Documentation (`apps/admin/docs/Modules.md`) mise à jour pour refléter
  l'état réel plutôt que l'état documenté au moment du Volume 6.

## [0.8.0] — Master Prompt Volume 8 : QA, CI/CD, Docker, Déploiement & Exploitation

**Dernier volume du Master Prompt (8/8).**

- **`docs/PROJECT_STATUS.md`** (nouveau, critique) — distingue explicitement
  IMPLEMENTED / TESTED / VERIFIED / DEPLOYED pour chaque composant du
  projet, conformément à l'interdiction de simulation du Volume 8 §67.
  Aucun composant n'est VERIFIED ou DEPLOYED : l'environnement de
  construction n'a ni réseau sortant, ni daemon Docker, ni base de données
  réellement démarrée, ni runner CI/CD.
- **RGPD** : nouveau module `privacy` — export complet des données
  personnelles, suppression de compte par anonymisation (préserve les
  données financières pour obligations comptables).
- **Observabilité Teddy** : capture de l'usage de tokens à chaque appel
  OpenAI, persistance tokens+coût estimé par message, endpoint admin
  d'agrégation des coûts sur une période.
- **`requireFeature()` (Volume 7) enfin câblé sur une vraie route** —
  `/teddy/generate-nutrition` protégée en Premium ; script de seed
  (`prisma/seed.ts`) créé pour que les `FeatureDefinition`/`FeatureFlag`
  existent réellement (gap découvert en écrivant le test E2E Premium).
- **Pipeline CI enrichie** (`ci.yml`) : jobs séparés lint/typecheck/tests
  unitaires, tests d'intégration avec migration réelle, sécurité (audit
  npm, scan de secrets Gitleaks, lint Dockerfile).
- **Workflow de déploiement contrôlé** (`deploy.yml`) : staging automatique
  → smoke tests → production avec approbation manuelle obligatoire.
  Commandes de déploiement concrètes explicitement marquées
  `### À CONFIGURER ###` (hébergeur non tranché).
- **Tests E2E** (Supertest contre l'app réelle) pour les 4 parcours
  critiques : inscription, entraînement (+ test d'accès horizontal),
  Premium (Free→webhook→Entitlement→fonctionnalité débloquée), VIP
  (octroi avant inscription, révocation immédiate, fenêtre expirée).
- 🐛 **Bugs Docker corrigés** : génération Prisma manquante dans le build
  (aurait cassé le build en usage réel), absence de healthcheck sur le
  service backend, chemin `.env` incohérent entre `docker-compose.yml` et
  la documentation.
- **6 documents de déploiement** (deployment/local-development/staging/
  production/rollback/disaster-recovery) + RTO/RPO + template de
  post-mortem + scripts de load testing (k6, paliers 100/1000) + config
  EAS (builds mobiles dev/staging/production) + catalogue de télémétrie.
- Template de PR, CODEOWNERS.
- ⚠️ **Écarts documentés** (voir `docs/PROJECT_STATUS.md` et
  `docs/telemetry/README.md`) : gestion des consentements RGPD, politique
  de rétention automatisée, télémétrie non câblée, choix d'hébergeur non
  tranché, aucun test E2E/CI/Docker réellement exécuté à ce jour.

## [0.7.0] — Master Prompt Volume 7 : E-commerce, Abonnements, Paiements & Shopify

- **EntitlementService** central (`backend/src/services/entitlement.service.ts`)
  — source unique de vérité des droits, priorité ADMIN>VIP>PRO>PREMIUM>FREE
  configurable, jamais de `if user.isPremium` en dur. Vérifié fraîchement à
  chaque requête (`requireFeature()` middleware), jamais mis en cache JWT.
- **Nouveau Domaine 13** (schéma Prisma) : `FeatureDefinition`,
  `SubscriptionPlan`, `SubscriptionPrice`, `Subscription`,
  `SubscriptionPayment`, `WebhookEvent` — strictement séparé du Domaine 11
  (Boutique) : un abonnement digital n'est jamais une `Order`.
- **Abstraction `PaymentProvider`** (`StripeProvider`/`PayPalProvider`) —
  aucun appel prestataire dispersé ailleurs dans le code. Apple Pay/Google
  Pay traités comme méthodes de paiement Stripe, jamais une logique dédiée.
- **Module Subscriptions** : création (avec coupon optionnel),
  annulation (`cancelAtPeriodEnd` par défaut), traitement des événements de
  cycle de vie Stripe (renouvellement, échec de paiement, expiration).
- **Idempotence des webhooks** (`WebhookEvent`, `@@unique([provider, externalEventId])`)
  — partagée par Stripe et Shopify, dispatch par domaine (Boutique vs Abonnements).
- **ShopifyService** : synchronisation catalogue (client REST natif,
  pagination par `since_id`), vérification HMAC des webhooks en temps
  constant, mapping des statuts de commande.
- **Service de coupons** partagé Boutique/Abonnements — validation
  (expiration, limite d'utilisation), calcul déterministe de la réduction.
- 🐛 **Bug de sécurité critique corrigé** : `express.json()` global
  consommait le corps des requêtes avant que `express.raw()` (webhooks)
  ne s'exécute, cassant silencieusement toute vérification de signature
  HMAC Stripe/Shopify depuis le Volume 3. Corrigé en excluant explicitement
  les chemins webhook du parsing global (voir `docs/webhooks/README.md`).
- 🐛 Correction d'un bug hérité du Volume 6 (`"SUCCEEDED"` → `"PAID"`,
  mauvais nom d'enum `PaymentStatus`) dans le module admin-payments.
- **Tests** : EntitlementService (priorité + anti-falsification), VIP
  (lifetime/temporaire/expiration/révocation/reconnexion), idempotence
  webhooks, signature Shopify, coupons, abonnements (création/annulation/
  renouvellement/expiration), Shopify (sync/commandes/fulfillment),
  sécurité (§50 — résistance à la falsification de rôle/statut premium).
- **Documentation** : 6 dossiers (`docs/payments/`, `docs/subscriptions/`,
  `docs/vip/`, `docs/shopify/`, `docs/webhooks/`, `docs/entitlements/`).
- Aucun secret réel dans le dépôt (`.env.example` exhaustif, vérifié).
- ⚠️ **Écarts documentés** (voir README de chaque dossier `docs/`) : taxes/TVA
  par pays, détection de fraude heuristique, essai gratuit configurable par
  produit, migration d'abonnement avec proratisation, Google Play/App Store,
  dead-letter queue pour webhooks en échec répété.

## [0.6.0] — Master Prompt Volume 6 : BackOffice ERP

- **RBAC complet** : 8 rôles nommés (Super Admin, Admin, Support,
  Modérateur, Nutrition, Coach, Marketing, Analyst), 31 permissions
  granulaires (`config/permissions.ts`), résolues et embarquées dans le
  JWT à chaque émission de token.
- **Audit trail systématique** : `auditLogService` capture qui/quand/quoi/
  avant/après/IP/appareil sur toute action d'écriture sensible du
  BackOffice (utilisateurs, VIP, feature flags, sauvegardes).
- **Module `admin-users`** : liste paginée/recherche/tri, fiche utilisateur
  complète (profil/objectifs/poids/séances/badges/commandes/paiements/
  conversations Teddy/logs), suspend/réactive/supprime/change rôle/
  attribue Premium/réinitialise mot de passe — chaque action auditée.
- **Module `admin-payments`** : MRR/ARR estimés, répartition par
  abonnement, liste des paiements (voir avertissement méthodologique dans
  `apps/admin/docs/Modules.md`).
- **VIP** : import CSV en masse (`POST /admin/vip/import`).
- **Feature Flags** : ciblage complet (Tous/Premium/VIP/Bêta, pays,
  version minimale, rollout progressif) — schéma `FeatureFlag` étendu.
- **Sauvegardes** : déclenchement manuel + historique (`backupQueue`).
- **Frontend** : layout TopBar→Sidebar→Content→RightPanel, 18 sections
  filtrées par permission, `usePermissions()` comme source unique de
  vérité UI, nouvelles pages (UserDetail, AuditLogs, Payments, Backups,
  FeatureFlags).
- **Tests** : component (Button/Badge), table (DataTable), form
  (validation Zod), permission (`usePermissions`), integration (Sidebar ×
  RBAC), analytics (calcul MRR/ARR/conversion).
- **Documentation** : 7 fichiers dans `apps/admin/docs/` (Architecture,
  Roles, Permissions, Modules, Analytics, Teddy, Deployment).
- ⚠️ **Écarts documentés** (voir `apps/admin/docs/Modules.md`) : Teddy
  Control Center (tension d'architecture prompts-en-code vs éditables),
  Nutrition CMS, Boutique (sync Shopify), Abonnements (table Plan
  manquante), Communauté (modération), Analytics BI complet, Teddy CEO —
  tous documentés avec proposition d'implémentation plutôt que simulés.

## [0.5.0] — Master Prompt Volume 5 : Teddy AI Engine

- SDK `@fit4u/teddy-sdk` restructuré en 10 modules (Core, Memory, Coach,
  Nutrition, Recovery, Motivation, Analytics, Planner, Voice, Vision).
- Mémoire à 3 niveaux (permanente/évolutive/conversationnelle) + Teddy DNA
  (extraction de faits durables) + résumé long terme.
- Système hiérarchique de prompts (System→Safety→Domain→Memory→Context→
  Tools) assemblé exclusivement par `core/promptChain.ts`.
- 12 outils internes déclarés (SDK) et exécutés (backend
  `tools/toolExecutor.ts`), boucle d'outils en 2 phases
  (`initiateTeddyTurn`/`completeTeddyTurn`).
- Sécurité IA à 5 domaines (détresse, dopage, diagnostic médical, blessure
  grave, comportement à risque), garde-fou permanent en plus de la détection.
- `ai.service.chat()` recâblé sur `TeddyCore` (remplace le flux simplifié
  du Volume 3).
- 8 fichiers de documentation (`packages/teddy-sdk/docs/`) + 6 fichiers de
  tests (safety/memory/tools/workflows/prompts/déterminisme).
- Logo officiel et photo de référence Teddy intégrés (`/assets/branding`,
  `/assets/teddy`) — position documentée sur la non-génération d'avatars
  photoréalistes (voir `assets/teddy/README.md`).
- ⚠️ **Écarts documentés** (voir `packages/teddy-sdk/docs/Evolution.md`) :
  Teddy Family (nouvelles tables Prisma nécessaires), Teddy CEO, exécuteur
  de workflow généralisé, Vision quantitative (pipeline pose estimation).

## [0.4.0] — Master Prompt Volume 4 : Frontend React Native + React Web

- Design system étendu (`@fit4u/ui`) : tokens complets (colors light/dark,
  spacing, radius, typography, shadows, motion, zIndex) + `buildTheme()`.
- Nouveau package partagé `@fit4u/api-client` : client HTTP centralisé (JWT,
  refresh avec file d'attente anti-rafale, retry+backoff, timeout,
  requestId) + configuration React Query (`queryClient`, `queryKeys`),
  consommé par les 3 apps via un adaptateur `TokenStorage` injecté.
- `@fit4u/types` réaligné sur le contrat réel du backend Volume 3 (rôles
  dynamiques, résolution VIP, DTO par domaine : workout, program,
  nutrition, progress, gamification, community, shop).
- **Mobile** (référence complète, 174 fichiers) : 24/25 composants du
  design system, 9 stores Zustand séparés (état client uniquement, jamais
  de cache serveur dupliqué), navigation complète (Auth/Onboarding/Main,
  5 onglets + navigation secondaire), 15 features complètes (auth avec
  OAuth Google/Apple natifs, onboarding 11 étapes alimentant Teddy,
  dashboard personnalisable, chat Teddy avec vocal Whisper + bulle
  flottante transverse, séance live avec chronomètre/repos
  automatique/remplacement d'exercice, exercices, nutrition avec scanner
  code-barres et analyse photo, progression avec graphiques Victory,
  gamification, communauté, boutique avec checkout Stripe/PayPal, premium,
  profil, paramètres), mode offline (bandeau réseau), pas natifs
  (`expo-sensors`).
- **Web** : infrastructure complète (thème light/dark/system, sidebar
  permanente responsive avec navigation clavier, client API, stores) +
  pages de référence (Login, Register, Dashboard).
- **BackOffice Admin** : 14 modules dans la Sidebar, `DataTable` générique
  (TanStack Table — recherche/tri/pagination/actions), 7 modules connectés
  à de vrais endpoints (Dashboard, VIP complet avec octroi/révocation,
  Exercices, Programmes, Support, Paramètres/feature flags, Monitoring),
  5 modules documentant honnêtement un gap backend plutôt que des données
  simulées.
- Restructuration `apps/mobile/src` de `modules/` (Volume 1) vers
  `features/` conformément à l'arborescence Volume 4 — migration propre,
  aucune perte de fonctionnalité.
- ⚠️ **Écarts documentés** (voir `docs/FRONTEND_ARCHITECTURE.md` §6) :
  i18n non branché dans les composants (chaînes FR en dur), endpoints admin
  manquants côté backend pour Utilisateurs/Boutique/Paiements/Sauvegardes,
  widgets natifs et Apple Watch/Wear OS non implémentés (hors Expo managé),
  suivi du sommeil sans source de données.

## [0.3.0] — Master Prompt Volume 3 : Backend Node.js + Express

- Backend Express complet restructuré selon l'arborescence Volume 3
  (`config/ database/ errors/ middleware/ routes/ controllers/ services/
  repositories/ validators/ utils/ jobs/ websocket/ ai/ modules/`).
- 14 modules métier complets (validators/repository/service/controller/routes
  documentées `@openapi`) : auth, users, profiles, exercises, programs,
  workouts, nutrition, progress, gamification, community, shop, payments,
  admin, analytics.
- Module `auth` réaligné sur le schéma Volume 2 : register/login/refresh
  (rotation)/logout/forgot-password/reset-password/verify-email/OAuth
  Google+Apple/me, RBAC dynamique, résolution VIP automatique à chaque
  authentification, brute force protection dédiée par email.
- Couche Teddy AI répartie : logique IA (prompts, orchestration, sécurité,
  génération structurée) déplacée dans `packages/teddy-sdk` (Volume 1) ;
  `backend/src/ai` orchestre uniquement (contexte via `TeddyMemoryService`,
  persistance via `AIRepository`) — routes `/teddy/chat|voice|
  generate-workout|generate-nutrition|analyze-progress|challenge`.
- Hiérarchie d'erreurs complète (`AppError` + 7 sous-classes), format JSON
  uniforme avec `requestId`, aucune stack technique exposée au client.
- 8 middlewares indépendants (auth, rate limit + brute force dédiée, erreur,
  validation, logger structuré, sécurité/Helmet, CORS, requestId).
- Observabilité : `/health`, `/health/ready`, `/metrics` (Prometheus), logs
  Pino structurés (`requestId`/`userId`/`route`/`duration`/`status`, secrets
  redacted).
- Temps réel : Socket.IO authentifié par JWT, 6 canaux (Teddy, Workout,
  Notifications, Challenges, Community, Analytics).
- 9 jobs BullMQ (rapports quotidien/hebdo/mensuel, email, notification,
  backup, analytics, subscription, challenge) planifiés en cron.
- Documentation Swagger/OpenAPI générée depuis les routes, servie sur `/docs`.
- Extension additive au schéma DB : table `favorite_exercises` (voir
  `docs/DATABASE_ARCHITECTURE.md` §7bis).
- Tests : Vitest (unitaires services, mocks repository) + Supertest
  (contrat HTTP réel via `createApp()`).
- ⚠️ Point ouvert documenté (non traité dans ce volume) : `apps/mobile`/
  `apps/web` consomment encore les DTO simplifiés du Volume 1 — adaptation
  nécessaire au prochain volume frontend. Voir `docs/BACKEND_ARCHITECTURE.md` §8.

## [0.2.0] — Master Prompt Volume 2 : Architecture PostgreSQL + Prisma

- Schéma Prisma canonique complet : 92 modèles (90 tables métier du Master
  Prompt + 2 tables de jonction techniques), 27 enums, 12 domaines
  fonctionnels (Auth, Profils, Exercices, Programmes, Entraînements,
  Nutrition, Teddy AI, Progression, Gamification, Communauté, Boutique,
  Administration).
- Conventions appliquées uniformément : UUID (`gen_random_uuid()`), UTC
  `TIMESTAMPTZ`, `createdAt`/`updatedAt` partout, soft delete (`deletedAt`)
  sur les tables métier, `snake_case`/`PascalCase`/`camelCase` mappés.
- RBAC dynamique (`Role`/`UserRole`) en remplacement de l'enum statique
  `UserRole` du Volume 1.
- Table `VipAccess` (accès Premium automatique par email, permanent ou
  temporaire) conforme au Master Prompt.
- Documentation : `docs/DATABASE_ARCHITECTURE.md` (décisions de
  modélisation par domaine, stratégie d'index et de suppression) et
  `docs/MIGRATIONS.md` (procédure 001_auth → 012_admin).
- ⚠️ **Breaking change documenté** (non corrigé dans ce volume) : le
  backend Volume 1 (`auth.repository.ts`, `auth.service.ts`,
  `@fit4u/types`) référence encore l'ancien `User` plat
  (firstName/lastName/isPremium/role) — adaptation nécessaire au prochain
  volume backend. Voir `docs/DATABASE_ARCHITECTURE.md` §3.

## [0.1.0] — Squelette initial du monorepo

- Mise en place du monorepo pnpm (`apps/*`, `backend`, `packages/*`).
- Configuration TypeScript stricte, ESLint, Prettier, CI GitHub Actions.
- Schéma Prisma initial (User, RefreshToken, AuditLog).
- Backend Express : bootstrap, sécurité de base (Helmet, CORS, rate limiting),
  gestion d'erreurs centralisée, module `auth` complet (register/login/refresh/logout),
  module `user` (profil).
- Packages partagés : `types`, `ui` (thème premium noir/orange/blanc), `config`,
  `teddy-sdk` (types de base du Coach IA Teddy).
- App mobile Expo : navigation, i18n (fr/en/es/de/it/pt), module `auth` de référence.
- Apps web et admin (Vite + React) : coquilles initiales, strictement séparées.
- Docker Compose (Postgres, Redis, backend) + scripts d'installation.
