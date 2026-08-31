# Conventions de migration — Fit4U by TH

## Principe

Prisma génère les migrations SQL par **diff** entre l'état actuel de la
base (historique dans `prisma/migrations/`) et l'état cible décrit dans
`schema.prisma`. Le fichier `schema.prisma` livré au Volume 2 est l'état
**final cible** des 12 domaines. Pour obtenir 12 migrations numérotées
`001_auth` → `012_admin` (une par domaine, comme spécifié) plutôt qu'une
seule migration monolithique, la génération doit se faire de façon
**incrémentale**, domaine par domaine, dans l'ordre ci-dessous.

## Ordre des migrations

| Ordre | Nom | Domaine | Modèles inclus |
|---|---|---|---|
| 001 | `001_auth` | Authentification | User (base), Session, RefreshToken, PasswordResetToken, EmailVerificationToken, Device |
| 002 | `002_profiles` | Profils | Profile, UserPreference, PrivacySetting, NotificationSetting, Role, UserRole |
| 003 | `003_exercises` | Exercices | MuscleGroup, ExerciseCategory, Equipment, Exercise, ExerciseVariant, ExerciseImage, ExerciseVideo, ExerciseTip, ExerciseMistake, ExerciseRestriction, ExerciseMuscleGroup, ExerciseEquipment |
| 004 | `004_programs` | Programmes | ProgramCategory, Program, ProgramWeek, ProgramDay, ProgramExercise, Warmup, Cooldown, StretchingProgram |
| 005 | `005_workouts` | Entraînements | WorkoutSession, WorkoutExercise, WorkoutHistory, WorkoutNote, PersonalRecord |
| 006 | `006_nutrition` | Nutrition | FoodCategory, Food, Recipe, RecipeIngredient, MealPlan, Meal, MealFood, WaterTracking, ShoppingList, ShoppingItem, NutritionGoal |
| 007 | `007_ai` | Teddy AI | AIConversation, AIMessage, AIWorkoutPlan, AINutritionPlan, AIProgressReport, AIChallenge, AIMemory |
| 008 | `008_progress` | Progression | WeightHistory, Measurement, ProgressPhoto, BodyComposition, Goal |
| 009 | `009_gamification` | Gamification | Level, UserXp, Badge, UserBadge, Challenge, UserChallenge, Reward, RewardHistory |
| 010 | `010_community` | Communauté | Post, Comment, Like, Friendship, Group, GroupMember, Event, EventParticipant |
| 011 | `011_shop` | Boutique | ProductCategory, Product, Cart, CartItem, Order, OrderItem, Coupon, Payment, Invoice |
| 012 | `012_admin` | Administration | VipAccess, AdminLog, AuditLog, FeatureFlag, SystemSetting, SupportTicket, SupportMessage |

Cet ordre respecte les dépendances de clés étrangères : aucun domaine ne
référence un modèle d'un domaine numéroté après lui (ex. `WorkoutSession`
référence `Program`, donc `005_workouts` vient après `004_programs`).

## Procédure de génération (environnement de développement)

Une fois une base PostgreSQL 16+ accessible via `DATABASE_URL` :

```bash
# 1. S'assurer que prisma/schema.prisma est réduit au Domaine 1 uniquement
#    (commit git dédié, ou fichier de travail temporaire), puis :
pnpm prisma migrate dev --name 001_auth

# 2. Étendre le schéma au Domaine 2 (Profils), puis :
pnpm prisma migrate dev --name 002_profiles

# 3. Répéter pour chaque domaine dans l'ordre du tableau ci-dessus,
#    jusqu'à 012_admin — le schéma final obtenu est alors strictement
#    identique au prisma/schema.prisma livré dans ce volume.
```

Chaque commande génère un dossier `prisma/migrations/<timestamp>_<name>/`
contenant le SQL généré automatiquement par Prisma (`migration.sql`),
appliqué immédiatement à la base de développement.

### Alternative — schéma final appliqué en une fois

Pour un environnement où l'historique migration-par-migration n'est pas
requis (ex. premier déploiement d'un environnement de test jetable), le
schéma final peut être appliqué directement :

```bash
pnpm prisma migrate dev --name 000_initial_schema
```

Cette commande unique produit une seule migration couvrant les 90 tables.
**Recommandation** : réserver cette approche aux environnements éphémères
(CI, preview) ; utiliser la procédure incrémentale 001→012 pour
`main`/`develop` afin de conserver un historique de migration lisible et
un rollback ciblé possible par domaine.

## Environnement CI (déjà configuré — Volume 1)

Le pipeline `.github/workflows/ci.yml` provisionne un service PostgreSQL
16 éphémère et exécute `pnpm prisma:generate` avant les tests. Aucune
modification requise pour ce volume : la CI applique le schéma final via
`prisma migrate deploy` en production / `prisma db push` en environnement
de preview jetable (à configurer lors du volume dédié au déploiement).

## Convention de nommage pour les migrations futures (Volume 3+)

Toute nouvelle migration hors de ce lot initial suit :

```
<NNN>_<description_snake_case>
```

où `NNN` est le prochain numéro disponible (013, 014…), et la description
est un verbe d'action court (`013_add_hyrox_program_tags`,
`014_add_stripe_subscription_id_to_profile`). Une migration = un
changement logique cohérent, jamais un lot de changements non liés.
