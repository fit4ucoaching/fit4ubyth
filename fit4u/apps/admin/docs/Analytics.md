# Analytics — BackOffice ERP

## Ce qui existe

`GET /admin/dashboard` (module `admin`, Volume 3) : utilisateurs totaux,
nouveaux 30j, VIP actifs, commandes totales, revenu total, tickets
ouverts. `GET /admin/payments/overview` (Volume 6) : MRR/ARR estimés,
répartition par abonnement, paiements des 30 derniers jours.

## Ce qui manque pour le "véritable BI Dashboard" du Volume 6

Le Master Prompt demande des graphiques Utilisateurs/Rétention/Revenus/
Conversion/Nutrition/Workouts/Teddy/Boutique/Défis/Temps d'utilisation,
avec filtres Jour/Semaine/Mois/Année/Pays/Plateforme/Abonnement. Aucun de
ces axes de filtrage (pays, plateforme) n'est capturé au schéma Volume 2 —
`User`/`Profile` n'ont pas de champ pays ou plateforme d'inscription.

**Proposition d'implémentation** (non construite ce volume) :
1. Ajouter `country: String?` et `platform: "IOS"|"ANDROID"|"WEB"` à `Profile` (Volume 2).
2. Créer un module `backend/src/modules/analytics-bi/` avec des requêtes
   d'agrégation Prisma `groupBy` paramétrées par période/pays/plateforme.
3. Réutiliser `Recharts` (déjà en dépendance) pour les graphiques — le
   pattern `DashboardPage.tsx` (BarChart) est directement extensible.
4. La rétention nécessite un calcul de cohortes (utilisateurs actifs à
   J+7/J+30 après inscription) — requête plus complexe, à isoler dans son
   propre repository plutôt que de surcharger `AdminRepository`.

## Distinction avec Teddy Analytics (Volume 5)

Ne pas confondre avec `packages/teddy-sdk/src/analytics/` (Volume 5) qui
génère les rapports individuels Daily/Weekly/Monthly d'un UTILISATEUR. Ce
module BackOffice agrège au niveau PLATEFORME. Les deux pourraient à terme
partager la détection de tendance (`detectTrend()`) sur des métriques
globales plutôt qu'individuelles.
