# Architecture PostgreSQL + Prisma — Fit4U by TH

**Master Prompt Volume 2/8 — Document de référence (niveau CTO)**
**Rôle** : Database Architect / Senior Database Engineer
**Statut** : source de vérité de la couche de données. Toute évolution du
schéma doit être proposée comme une mise à jour de ce document + de
`prisma/schema.prisma`, jamais divergente.

---

## 1. Vue d'ensemble

La base de données PostgreSQL 16+ est organisée en **12 domaines
fonctionnels** correspondant chacun à un sous-système métier de la
plateforme. Elle est modélisée intégralement via **Prisma ORM**
(`prisma/schema.prisma`, fichier unique, source de vérité exécutable).

| # | Domaine | Tables | Rôle |
|---|---------|:---:|------|
| 1 | Authentification | 6 | Identité, sessions, tokens, appareils |
| 2 | Profils | 6 | Données personnelles, préférences, RBAC |
| 3 | Exercices | 10 (+2 jonctions) | Catalogue d'exercices |
| 4 | Programmes | 8 | Programmes d'entraînement structurés |
| 5 | Entraînements | 5 | Séances réellement effectuées |
| 6 | Nutrition | 11 | Aliments, recettes, plans, courses |
| 7 | Teddy AI | 7 | Données du Coach IA (pas de logique) |
| 8 | Progression | 5 | Suivi physique dans le temps |
| 9 | Gamification | 8 | XP, badges, défis, récompenses |
| 10 | Communauté | 8 | Posts, amis, groupes, événements |
| 11 | Boutique | 9 | Cache local Shopify, commandes, paiements |
| 12 | Administration | 7 | VIP, audit, support, feature flags |

**Total : 90 tables** (conformes au Master Prompt Volume 2) **+ 2 tables de
jonction techniques** (`exercise_muscle_groups`, `exercise_equipments`)
nécessaires à la normalisation many-to-many du domaine Exercices — non
nommées explicitement dans le Master Prompt mais requises pour éviter toute
dénormalisation (colonnes JSON à la place de relations), ce qui aurait
contredit l'exigence "architecture robuste et normalisée".

---

## 2. Conventions globales (rappel exécutable)

| Règle | Implémentation Prisma |
|---|---|
| UUID en PK | `id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid` |
| Dates UTC | `@db.Timestamptz(6)` sur tous les champs date/heure |
| `createdAt` / `updatedAt` | Sur **toutes** les tables (`@default(now())` / `@updatedAt`) |
| Soft delete | `deletedAt DateTime? @db.Timestamptz(6)` sur les tables **métier** (entités principales : `User`, `Profile`, `Exercise`, `Program`, `WorkoutSession`, `Post`, `Product`, `Order`…) |
| Pas de soft delete | Tables de jonction, de log ou append-only (`workout_history`, `audit_logs`, `ai_messages`, `likes`, `event_participants`…) — elles sont immuables ou supprimées physiquement avec leur parent (`onDelete: Cascade`) |
| Nommage tables | `snake_case` via `@@map("...")` |
| Nommage modèles | `PascalCase` (nom du modèle Prisma) |
| Nommage colonnes | `camelCase` côté Prisma, mappé en `snake_case` via `@map("...")` quand différent |
| Contraintes | `FOREIGN KEY` (implicite via `@relation`), `UNIQUE` (`@unique`/`@@unique`), `ON DELETE` explicite sur chaque relation |
| Index | `@@index` sur toutes les FK fréquemment filtrées + colonnes de tri (`createdAt`, `startedAt`…) |

### Stratégie `ON DELETE`

- **`Cascade`** — données strictement dépendantes de leur parent et sans
  valeur hors de ce contexte (ex. `WorkoutExercise` dépend de
  `WorkoutSession`, `Comment`/`Like` dépendent de `Post`).
- **`Restrict`** — le parent ne doit jamais pouvoir disparaître tant que des
  enregistrements financiers/catalogue en dépendent (ex. `Exercise` ne peut
  pas être supprimé s'il est référencé par un `ProgramExercise` ; `Order`
  ne peut pas être supprimé s'il a des `Payment`).
- **`SetNull`** — la relation est informative mais non bloquante (ex. un
  `Device` supprimé met `Session.deviceId` à `null` plutôt que de supprimer
  la session).

Cette matrice évite spécifiquement les "suppressions en cascade
dangereuses" mentionnées dans le Master Prompt (ex. supprimer un `User` ne
doit jamais supprimer silencieusement son historique de commandes — voir
§4.11, `Order.user` est en `Restrict`).

---

## 3. Le modèle `User` — hub central

`User` est délibérément un **God Model** avec ~49 relations inverses
(une par table qui le référence à travers les 12 domaines). C'est un
compromis assumé et documenté plutôt qu'une simplification :

- **Avantage** : toute navigation `user.XXX` depuis Prisma Client est
  immédiatement disponible et type-safe, sans jointure manuelle.
- **Coût connu** : le modèle est long (~60 lignes de relations). À très
  grande échelle (plusieurs millions d'utilisateurs), certaines lectures
  agrégées (ex. flux communauté, analytics) devront passer par des **vues
  matérialisées** ou une architecture de lecture dédiée (read replica),
  plutôt que par des `include` Prisma profonds sur `User` — voir §7.

`User` ne porte que l'**identité et l'authentification** (email, hash de
mot de passe, provider, statut, locale). Les données personnelles
(prénom, nom, avatar, mensurations) vivent dans `Profile` — séparation
volontaire entre ce qui est stable (identité) et ce qui change souvent
(profil), conforme à la 3ᵉ forme normale.

### ⚠️ Évolution par rapport au Volume 1 (impact backend)

Le schéma bootstrap créé au Volume 1 (`backend/prisma/schema.prisma`,
désormais remplacé par ce fichier canonique) avait un `User` simplifié
avec `firstName`, `lastName`, `role` (enum), `isPremium` directement sur la
table. Le Volume 2 **déplace** ces champs :

| Volume 1 (obsolète) | Volume 2 (canonique) |
|---|---|
| `User.firstName` / `User.lastName` | `Profile.firstName` / `Profile.lastName` |
| `User.isPremium` | `Profile.isPremium` (+ `Profile.subscription`, + `VipAccess` pour le VIP) |
| `User.role` (enum statique `USER/COACH/ADMIN/SUPER_ADMIN`) | RBAC dynamique via `Role` + `UserRole` (table de jonction) |

**Impact code à traiter dans un prochain volume (backend)** :
`backend/src/modules/auth/auth.repository.ts` (`createUser`),
`auth.service.ts` (`toAuthenticatedUser`) et `@fit4u/types`
(`UserDTO`) référencent encore les anciens champs plats. Ils devront être
adaptés pour créer un `Profile` associé à l'inscription et résoudre le rôle
via `UserRole`. Cette adaptation n'est **pas** effectuée dans ce volume
(purement dédié à la base de données) — elle est notée ici pour ne rien
casser silencieusement, conformément à la Règle Absolue N°2 du Volume 1.

---

## 4. Domaines — décisions de modélisation notables

### 4.1 Authentification
`Session` (état de connexion, révocable par appareil) est distincte de
`RefreshToken` (rotation JWT). Cette séparation permet d'afficher à
l'utilisateur une liste "Appareils connectés" et de révoquer une session
sans invalider tous les refresh tokens.

### 4.2 Profils
`Role`/`UserRole` remplacent un enum statique pour permettre la création de
rôles métier (ex. "Modérateur Communauté", "Coach Nutrition") sans
migration de schéma — seulement une ligne insérée dans `roles`.

### 4.3 Exercices
Deux tables de jonction techniques (`exercise_muscle_groups`,
`exercise_equipments`) normalisent les relations many-to-many (un exercice
sollicite plusieurs muscles, nécessite plusieurs équipements) — voir §1.

### 4.4 Programmes
Hiérarchie stricte `Program → ProgramWeek → ProgramDay → ProgramExercise`.
`Warmup`/`Cooldown`/`StretchingProgram` sont rattachés à `ProgramDay` (et
non à `Program`) pour permettre un échauffement différent chaque jour.

### 4.5 Entraînements
`WorkoutSession` (planifiée/réelle) est **distincte** de `ProgramDay`
(définition théorique) : une séance peut diverger du programme (poids
réel, séries réellement complétées). `WorkoutHistory` est un journal
append-only des événements (start/pause/resume/complete) utile au support
et à l'analytics comportemental.

### 4.6 Nutrition
`MealFood`/`RecipeIngredient` référencent `Food` (base nutritionnelle pour
100g) — les calories/macros d'un repas sont **calculées à la volée** côté
application à partir de la quantité, jamais dupliquées en base (source
unique de vérité nutritionnelle).

### 4.7 Teddy AI
Conformément au Volume 1, ces tables ne contiennent **aucune logique** —
uniquement des données (conversations, messages, plans générés, mémoire
long-terme). L'interprétation et la génération restent entièrement dans
`packages/teddy-sdk`. `AIWorkoutPlan`/`AINutritionPlan` sont volontairement
séparés des tables éditoriales (`Program`, `MealPlan`) : le contenu généré
par IA suit un cycle de vie différent (`AIPlanStatus` : DRAFT → ACTIVE →
COMPLETED/ARCHIVED) et n'est jamais mélangé au catalogue produit par
l'équipe Fit4U.

### 4.8 Progression
Toutes les tables sont append-only par nature (chaque pesée, mensuration,
photo est un point dans le temps) — l'historique complet est la donnée
utile, jamais un simple "dernier état".

### 4.9 Gamification
`UserXp` est un état courant 1-1 (dénormalisation volontaire et
assumée : total XP + niveau actuel) mis à jour à chaque gain, pour éviter
de recalculer une somme sur tout l'historique à chaque affichage —
compromis performance classique en gamification à grande échelle.

### 4.10 Communauté
`Friendship` utilise une seule ligne orientée (`requesterId` →
`addresseeId`) plutôt que deux lignes symétriques, avec un statut
(`FriendshipStatus`). Cela évite les incohérences de synchronisation entre
deux lignes miroir. `Like` est volontairement limité aux posts (pas aux
commentaires) dans cette version — extension prévue en table polymorphe si
le besoin apparaît (voir §7).

### 4.11 Boutique
**Rappel Volume 1** : Shopify reste la source de vérité commerciale
(catalogue, stock, checkout). Ces tables sont un **cache de lecture +
historique de facturation interne**, réconcilié via `shopifyProductId` /
`shopifyOrderId`. `OrderItem.unitPriceCents` est un **snapshot** au moment
de l'achat (jamais recalculé depuis `Product.priceCents`) pour garantir
l'intégrité des factures historiques même si le prix catalogue change
ensuite.

### 4.12 Administration
`VipAccess.userId` est nullable et la résolution se fait par **email** en
priorité (conforme au Master Prompt : "Une adresse email présente dans
cette table obtient automatiquement tous les droits Premium") — cela
permet d'accorder un accès VIP à une adresse email **avant même
l'inscription** de la personne ; le lien `userId` est complété
automatiquement à l'inscription (logique applicative à implémenter dans le
module `auth`/`admin` du backend).

---

## 5. Index — stratégie

Au-delà des index explicitement listés dans le Master Prompt (tous
implémentés — voir `@@index` sur `users.email`, `users.status`,
`profiles.userId`, `workout_sessions.userId/startedAt/completedAt`,
`weight_history.userId/recordedAt` [`date` → `recordedAt` dans ce schéma],
`posts.userId/createdAt`, `orders.userId/status`, `payments.userId/status`,
`vip_access.email/isActive`, `ai_messages.conversationId/createdAt`), des
index supplémentaires ont été ajoutés systématiquement sur :

- toute colonne de clé étrangère (coût d'écriture négligeable, gain de
  lecture indispensable dès que le volume dépasse quelques dizaines de
  milliers de lignes) ;
- les colonnes de tri chronologique utilisées en pagination
  (`createdAt`, `startsAt`, `scheduledAt`, `expiresAt`) ;
- les colonnes de recherche fréquente hors PK (`barcode` sur `Food`,
  `code` sur `Coupon`, `slug` sur les tables catalogue).

Des **index composites** seront ajoutés au fil de l'eau selon les patterns
de requêtes réels observés en production (ex. `(userId, status)` sur
`WorkoutSession` si le filtre combiné devient fréquent) — décision
différée à la mise en observation réelle plutôt que spéculative.

---

## 6. Pagination & performance

Toute table à fort volume (`workout_sessions`, `weight_history`, `posts`,
`ai_messages`, `orders`…) doit être consommée **paginée** côté backend
(voir `PaginationParams`/`PaginatedResult` dans `packages/types`), jamais
via un `findMany()` sans `take`/`skip` ou curseur. Le pattern recommandé à
grande échelle est la **pagination par curseur** (`cursor` sur `id` ou
`createdAt`) plutôt que `OFFSET`, dont le coût croît linéairement avec la
profondeur de pagination.

---

## 7. Évolutions futures anticipées (non implémentées dans ce volume)

Ces points sont documentés comme **extensions prévues**, volontairement
hors périmètre du Volume 2 pour ne pas livrer de structures spéculatives
non requises par le Master Prompt actuel :

- **Vues matérialisées analytics** (mentionnées dans le Master Prompt) :
  à définir domaine par domaine une fois les besoins de reporting
  (BackOffice/ERP) précisés dans un volume dédié.
- **Likes polymorphes** (posts + commentaires) si le produit l'exige.
- **Read replicas** pour les lectures lourdes (flux communauté,
  dashboards admin) à l'approche de la charge "plusieurs millions
  d'utilisateurs" mentionnée en objectif produit.
- **Partitionnement** des tables de log/historique à très fort volume
  (`ai_messages`, `workout_history`, `audit_logs`) par plage de dates,
  une fois des seuils de volumétrie réels atteints.

---

## 7bis. Addendum Volume 3 — `favorite_exercises`

Le module backend `exercises` (Volume 3) expose `POST /exercises/favorite`, fonctionnalité
non couverte par une table nommée du Master Prompt Volume 2. Une table `favorite_exercises`
(join `User` ↔ `Exercise`, `@@unique([userId, exerciseId])`) a été ajoutée au schéma selon le
même principe que les 2 tables de jonction techniques du §1 — extension additive et non
cassante, documentée ici plutôt que silencieuse. Le schéma compte donc désormais **93 modèles**
(90 tables du Master Prompt + 3 tables techniques additives).

---

## 8. Fichiers livrés

- `prisma/schema.prisma` — schéma complet (92 modèles, 27 enums, 1995
  lignes), directement compatible `prisma generate` / `prisma migrate dev`
  dès qu'une base PostgreSQL 16+ est connectée via `DATABASE_URL`.
- `docs/MIGRATIONS.md` — conventions et procédure de génération des 12
  migrations numérotées (001 à 012).
