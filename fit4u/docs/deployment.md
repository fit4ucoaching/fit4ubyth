# Déploiement — Vue d'ensemble (Volume 8)

## ⚠️ Statut honnête (Volume 8 §67 — interdiction de simulation)

**Aucun déploiement réel n'a été effectué.** Ce document décrit
l'architecture et le flux de déploiement CONÇUS et IMPLÉMENTÉS
(workflows CI/CD, Dockerfiles, scripts) — jamais TESTÉS sur une
infrastructure réelle, jamais VÉRIFIÉS en conditions réelles, jamais
DÉPLOYÉS. Voir `docs/PROJECT_STATUS.md` pour le détail de cette
distinction appliqué à chaque composant du projet.

## Environnements (Volume 8 §3)

| Environnement | Base de données | Secrets | Objectif |
|---|---|---|---|
| `development` | Locale (Docker Compose) | `.env` local, jamais commité | Développement quotidien |
| `staging` | Instance dédiée, isolée de production | Gestionnaire de secrets CI (GitHub Environments) | Validation avant mise en production |
| `production` | Instance dédiée, jamais partagée | Gestionnaire de secrets dédié + approbation manuelle | Utilisateurs réels |

**Aucune donnée, secret, clé API ou webhook n'est jamais partagé entre
environnements** (Volume 8 §3) — en particulier, les comptes de paiement
Stripe/PayPal de test et de production sont des comptes strictement
distincts (clés `sk_test_*` vs `sk_live_*`), de même pour la boutique
Shopify de test.

## Choix d'hébergement — NON TRANCHÉ

Ce projet n'a pas encore choisi d'hébergeur cible (Railway, Render,
Fly.io, AWS ECS, etc.). Les workflows (`deploy.yml`) contiennent des
commandes placeholder explicitement marquées `### À CONFIGURER ###` —
la structure du flux (build → migrate → deploy → smoke test) est prête,
son exécution concrète dépend de cette décision.

## Flux de déploiement (Volume 8 §7)

```
git push
  ↓
CI (ci.yml) : Lint → Typecheck → Tests unitaires → Tests d'intégration → Sécurité → Build
  ↓
push develop → deploy.yml : Staging → Smoke Tests
  ↓
push main → deploy.yml : Production (approbation manuelle requise) → Smoke Tests
```

## Documents associés

- `docs/local-development.md` — démarrage local
- `docs/staging.md` — procédure de déploiement staging
- `docs/production.md` — procédure de déploiement production, RTO/RPO
- `docs/rollback.md` — procédure de retour arrière
- `docs/disaster-recovery.md` — procédure d'incident majeur
