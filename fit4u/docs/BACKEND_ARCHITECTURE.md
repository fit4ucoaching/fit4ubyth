# Architecture Backend — Fit4U by TH

**Master Prompt Volume 3/8 — Document de référence (niveau CTO)**
**Rôle** : Lead Backend Engineer / Senior Staff Backend Engineer

---

## 1. Vue d'ensemble

Backend Node.js/Express/TypeScript strict, organisé en **14 modules métier**
(`src/modules/*`) suivant tous rigoureusement le même pattern interne, plus
une couche IA isolée (`src/ai`) et une infrastructure transverse
(`config`, `database`, `errors`, `middleware`, `repositories`, `routes`,
`utils`, `jobs`, `websocket`).

```
Route → Middleware (auth/validation/rate-limit) → Controller → Service → Repository → Prisma
```

Aucun accès Prisma en dehors d'un `*.repository.ts` ; aucune règle métier
dans un `*.controller.ts` (parsing requête + appel service + formatage
réponse, rien d'autre) — invariants vérifiés module par module.

## 2. Modules livrés

| Module | Statut | Particularité |
|---|---|---|
| `auth` | Complet | Register/login/refresh (rotation)/OAuth Google+Apple/reset/verify, résolution VIP à chaque authentification |
| `users` | Complet | Profil, avatar (stockage disque en dev, interface prête pour S3), statistiques cross-domaine |
| `profiles` | Complet | Préférences, confidentialité, notifications (Domaine 2) |
| `exercises` | Complet | CRUD + recherche + filtres + favoris (`favorite_exercises`, voir addendum DB) |
| `programs` | Complet | CRUD éditorial + génération IA (délègue à `ai/`) |
| `workouts` | Complet | Start/pause/resume/finish, historique, statistiques, records, diffusion Socket.IO |
| `nutrition` | Complet | Aliments, recettes, génération de plan IA, hydratation, scan code-barres, analyse photo (Vision) |
| `progress` | Complet | Poids, mensurations, photos, historique, analytics de tendance |
| `gamification` | Complet | XP/niveaux, badges, défis (join/complete avec attribution d'XP) |
| `community` | Complet | Posts/commentaires/likes/groupes, diffusion temps réel |
| `shop` | Complet | Catalogue (cache Shopify), panier, checkout → commande PENDING |
| `payments` | Complet | Stripe PaymentIntent, PayPal Orders API (fetch natif), webhook signé, remboursement |
| `admin` | Complet | Dashboard, VIP (grant/revoke/list), support (tickets/réponses), settings, feature flags |
| `analytics` | Complet | Classements (Redis sorted sets), vue d'ensemble engagement |

Chaque module expose : `*.validators.ts` (Zod), `*.repository.ts`, `*.service.ts`,
`*.controller.ts`, `*.routes.ts` (documentées `@openapi`), `tests/`.

## 3. Couche Teddy AI — réconciliation Volume 1 / Volume 3

Le Volume 1 impose : *"Aucune logique IA ailleurs [que `packages/teddy-sdk`]"*.
Le Volume 3 impose : *"Créer un module dédié [backend]. Aucune logique IA
ailleurs."* Ces deux règles sont réconciliées ainsi :

- **`packages/teddy-sdk`** (Volume 1) : la logique IA elle-même — prompts
  versionnés (`prompts/systemPrompts.ts`), orchestration conversationnelle
  (`teddyConversationService.ts`), génération structurée JSON
  (`teddyGenerationService.ts`), garde-fous de sécurité
  (`teddySafetyService.ts`, détection de détresse → redirection vers le
  3114). Le SDK ne lit **aucune variable d'environnement** et reçoit un
  client `OpenAI` déjà configuré en paramètre — il reste agnostique du
  runtime qui l'appelle.
- **`backend/src/ai`** (Volume 3) : la couche de **consommation HTTP** —
  routes `/teddy/*`, contrôleur, et un service d'orchestration
  (`ai.service.ts`) qui ne fait que : récupérer le contexte utilisateur
  (via `TeddyMemoryService`, "service spécialisé" explicitement demandé),
  appeler le SDK, persister le résultat (via `AIRepository`). Il ne
  construit jamais de prompt ni n'interprète une réponse IA lui-même.

`TeddyMemoryService.buildContext()` agrège objectifs, poids, préférences,
équipement, historique d'entraînement, objectif calorique, défis actifs et
blessures déclarées — ces dernières stockées dans `AIMemory` (clé
`declared_injuries`) faute de table dédiée au schéma Volume 2, exactement
l'usage pour lequel cette table clé/valeur flexible a été conçue.

## 4. Sécurité

- **JWT** : access token (15 min) contenant `roles[]` et `isPremium` (évite
  une requête DB par requête authentifiée — révocation VIP effective sous
  15 min max, ou immédiate au prochain refresh).
- **Refresh token** : rotation stricte (l'ancien est révoqué dès qu'un
  nouveau est émis), stocké hashé (SHA-256) en base, jamais en clair.
- **Brute force** : compteur dédié **par email ciblé** (`rate-limiter-flexible`
  + Redis), distinct du rate limiting générique par IP — un attaquant
  distribué reste bloqué sur le compte visé.
- **Mots de passe** : bcrypt (12 rounds) ; tout changement de mot de passe
  révoque automatiquement toutes les sessions/refresh tokens actifs.
- **Webhook Stripe** : signature HMAC vérifiée sur le corps brut
  (`express.raw()`, monté avant `express.json()` global — voir `app.ts`).
- **Erreurs** : hiérarchie `AppError` (7 sous-classes), format JSON uniforme
  `{ success:false, error:{ code, message, details, requestId } }`, aucune
  stack technique exposée au client en production comme en développement.

## 5. Observabilité

- **Logs** (Pino) : `requestId`/`userId`/`route`/`durationMs`/`status`
  systématiques, secrets automatiquement redacted (`config/logger.ts`).
- **Métriques** (`prom-client`) : `/metrics` (format Prometheus), histogramme
  de durée + compteur de requêtes par route/méthode/statut.
- **Health checks** : `/health` (liveness, ne vérifie rien) et
  `/health/ready` (readiness, vérifie PostgreSQL + Redis).

## 6. Temps réel (Socket.IO)

Authentification par le même JWT access token que l'API REST
(`socketAuth.middleware.ts`). Room personnelle `user:{userId}` rejointe à la
connexion (cible directe depuis `jobs/notification.job.ts`). 6 canaux
(`websocket/channels/`) : `teddy` (chat), `workout` (progression live),
`notifications` (passif), `challenges` (score live), `community`
(posts/groupes), `analytics` (dashboard admin, room réservée aux rôles
ADMIN/SUPER_ADMIN).

## 7. Jobs (BullMQ)

9 queues dédiées (`jobs/queue.ts`), chacune avec son propre worker
(`*.job.ts`) : rapports quotidien/hebdo/mensuel (analytics internes),
email (SMTP via Nodemailer), notification (diffusion Socket.IO + respect
des préférences `NotificationSetting`), backup (déclenchement, exécution
dépendante de l'infra), analytics (recalcul du classement XP en Redis
sorted set), subscription (détection des VIP expirant sous 3 jours),
challenge (transition automatique des statuts selon les dates).

## 8. Points d'extension documentés (non implémentés — hors périmètre Volume 3)

- **Stockage fichiers** : adaptateur disque local (`users/storage.service.ts`)
  à remplacer par S3/Cloudinary en production — interface déjà posée pour
  un remplacement sans impact sur les services appelants.
- **PayPal refund** : structurellement symétrique à `createPayPalOrder`
  (même pattern `fetch` + Orders/Captures API), non détaillé pour éviter la
  duplication dans ce document.
- **Push mobile réel (APNs/FCM)** : `jobs/notification.job.ts` diffuse déjà
  en temps réel via Socket.IO ; l'appel au provider de push natif est le
  seul segment non exécutable sans credentials APNs/FCM réels.
- **Adaptation `apps/mobile`/`apps/web`** : les DTO `@fit4u/types`
  (`AuthResult`, `UserDTO`) reflètent encore le contrat simplifié du
  Volume 1. Le backend Volume 3 renvoie désormais `roles[]`, `status`,
  `locale` et une résolution VIP dynamique — l'adaptation des apps
  consommatrices est un prochain chantier, volontairement hors périmètre
  d'un volume dédié au backend seul.

## 9. Validation effectuée

Sans accès réseau pour `tsc`/`eslint` réels en sandbox, une validation
structurelle automatisée a été menée sur les 136 fichiers `.ts` du backend :
équilibre des accolades, résolution de tous les imports relatifs vers un
fichier existant, correspondance des imports nommés inter-modules avec les
exports réels. Zéro problème réel détecté (voir historique de session pour
le détail des deux faux positifs de script corrigés en cours de route).
