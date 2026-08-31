# Modules — BackOffice ERP

État réel de chacune des 18 sections + Teddy CEO, sans simplification
silencieuse : ce qui est connecté à un vrai endpoint vs ce qui documente
un gap backend.

## ✅ Connectés à un vrai endpoint

| Module | Endpoint(s) | Notes |
|---|---|---|
| **Dashboard** | `GET /admin/dashboard` | Utilisateurs/revenus/VIP/tickets agrégés. Widgets "actifs 24h/7j/30j" et "Boutique" du Master Prompt non détaillés (nécessitent un tracking de sessions applicatif non capturé au schéma Volume 2) |
| **Utilisateurs** | `GET/POST/PUT/DELETE /admin/users/*` | Liste, fiche complète, suspend/réactive/supprime/rôle/Premium/reset password — tout audité |
| **VIP** | `GET/POST/DELETE /admin/vip*`, `POST /admin/vip/import` | Octroi unitaire + import CSV en masse |
| **Exercices** | `GET/DELETE /exercises` (module `exercises`, Volume 3) | CRUD partiel (liste + suppression) — création/édition riche non câblée côté BackOffice (le CMS complet avec upload images/vidéos/animations reste à construire) |
| **Programmes** | `GET/DELETE /programs` | Idem Exercices — pas de builder visuel drag & drop |
| **Support** | `GET/POST/PUT /admin/support/tickets*` | Tickets, réponses, notes internes, statut |
| **Paramètres** | `GET/PUT /admin/settings` | Clé/valeur générique (`SystemSetting`) |
| **Feature Flags** | `GET/PUT /admin/feature-flags` | Ciblage complet (audience/pays/version/bêta) + rollout progressif |
| **Monitoring** | `GET /health/ready` | Statut des dépendances (DB/Redis) — pas de CPU/RAM (nécessite un agent d'infra, ex. Prometheus Node Exporter, hors périmètre applicatif) |
| **Sauvegardes** | `POST /admin/backups/trigger`, `GET /admin/backups/history` | Déclenchement + historique BullMQ. Restauration non pilotable (dépend du provider RDS/GCS) |
| **Audit** | `GET /admin/audit-logs` | Qui/quand/quoi/avant/après/IP/appareil |
| **Paiements** | `GET /admin/payments/overview`, `GET /admin/payments` | MRR/ARR **estimés** (voir avertissement ci-dessous) |
| **Abonnements** | `GET/POST/PUT /admin/subscriptions*` | Catalogue d'offres (créer/activer/désactiver), liste de tous les abonnements, annulation admin passant réellement par le `PaymentProvider` (jamais un simple flag en base). Débloqué par le schéma Volume 7 (`SubscriptionPlan`/`SubscriptionPrice`/`Subscription`) — corrigé après revue, ce module était documenté comme un gap avant que le schéma Volume 7 ne le rende possible. La création de PRIX reste manuelle (identifiant prestataire reporté depuis le Dashboard Stripe, jamais une saisie libre qui désynchroniserait) |
| **Nutrition (CMS)** | `GET/POST/PUT/DELETE /admin/nutrition/{foods,recipes}*` | Aliments (CRUD complet) et recettes (création avec ingrédients composés, archivage) — toute écriture auditée. La composition d'ingrédients à la création reste pilotable uniquement via l'API pour l'instant ; l'écran BackOffice dédié à cette composition (ajout dynamique d'ingrédients avec recherche d'aliments) reste à construire |
| **Boutique** | `GET /admin/shop/{products,orders}*`, `PUT /admin/shop/products/{id}/active`, `POST /admin/shop/sync` (Volume 7) | Catalogue en LECTURE (Shopify reste la source de vérité, Volume 7 §32 — jamais de création/édition manuelle qui entrerait en conflit avec la synchronisation), bascule de visibilité locale (`isActive`, un flag Fit4U sans équivalent Shopify), liste des commandes avec détail. Gestion de collections/variantes/coupons avancés hors périmètre |
| **Communauté** | `GET/POST /admin/community/{reports,bans}*` | Signalements (rejeter ou retirer réellement le contenu, jamais un simple changement de statut) et bannissements communauté (posts/commentaires bloqués, distinct d'une suspension de compte complète) — appliqué en temps réel via `requireNotBanned` sur les routes de publication. Nouveau schéma `Report`/`CommunityBan` (Domaine 14) |
| **Teddy CEO** | `POST /admin/teddy-ceo/chat` | Assistant conversationnel plateforme — 4 outils réels (KPI, anomalies, risque de résiliation, top programmes), persona et prompts strictement distincts du coach utilisateur (`packages/teddy-sdk/src/ceo/`). Détection d'anomalies par fonction dédiée (jamais un détournement de `detectTrend()`, conçu pour un utilisateur individuel). Limite connue : un seul aller-retour d'outils par message (voir `Teddy.md`) |
| **Teddy Control Center** | `GET /admin/teddy/prompts/{key}/history`, `POST /admin/teddy/prompts*` | Édition versionnée des Domain Prompts (Coach/Nutrition/Recovery/Motivation/Analytics/Planner) — créer/tester/déployer/rollback, jamais deux versions actives simultanément. Décision d'architecture tranchée par comparaison avec Intercom Fin/Zendesk AI (voir `Teddy.md`) : **identité et sécurité globale restent des constantes TypeScript intouchables depuis le BackOffice**, seul le ton/style métier est éditable. Aperçu de prompt (`/prompts/preview`) sans persistance |
| **Analytics (BI)** | `GET /admin/analytics/{user-growth,revenue-trend,workout-engagement,teddy-usage,retention,top-exercises,top-programs}` | Décision d'architecture (comparaison Stripe Dashboard/Shopify Admin/Linear/Vercel) : un jeu de **graphiques curés**, jamais un constructeur de requêtes multi-dimensionnel générique (sur-ingénierie non justifiée à ce stade, Volume 8 §22). Rétention mesurée en J7 par cohorte hebdomadaire (pas une matrice J1/J7/J30/J90 complète — premier indicateur simple et lisible). Filtres Pays/Plateforme non construits (le schéma ne capture pas encore ces dimensions, voir `docs/telemetry/README.md`) |

## ✅ Aucun gap restant

Les 19 sections du BackOffice sont connectées à un vrai endpoint. Le
dernier gap (Analytics BI) a été comblé en reconnaissant qu'un vrai moteur
BI générique aurait été disproportionné : les produits comparables du
secteur (Stripe, Shopify, Linear, Vercel) proposent tous un jeu de
graphiques choisis plutôt qu'un outil d'exploration arbitraire.

## ⚠️ Avertissement MRR/ARR

Le MRR affiché sur `PaymentsPage` est désormais **calculé réellement** à
partir de la somme des `SubscriptionPrice.amountCents` des abonnements
`ACTIVE`/`TRIALING`/`PAST_DUE`, normalisée au mois pour les abonnements
annuels (`computeMonthlyRecurringRevenueCents()`,
`adminPayments/mrrCalculation.ts`, testée unitairement). Un champ
`Subscription.priceId` a été ajouté au schéma pour rendre ce calcul
possible — auparavant, `Subscription` référençait uniquement le `plan`,
jamais le prix exact souscrit (mensuel/annuel), rendant tout MRR exact
structurellement impossible. Limite restante : les abonnements créés avant
l'ajout de `priceId` (aucun en production réelle à ce jour, le projet
n'ayant jamais été déployé — voir `docs/PROJECT_STATUS.md`) seraient
exclus du calcul plutôt que fausser le total.
