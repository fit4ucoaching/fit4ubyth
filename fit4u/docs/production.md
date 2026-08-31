# Production — Fit4U by TH

## Release Checklist (Volume 8 §48 — obligatoire avant toute publication)

- [ ] Tests unitaires réussis (CI verte)
- [ ] Tests d'intégration réussis (CI verte)
- [ ] Tests E2E critiques réussis (exécutés manuellement — voir `docs/PROJECT_STATUS.md`, aucun runner E2E automatisé n'est branché en CI à ce jour)
- [ ] TypeScript validé (`pnpm typecheck`)
- [ ] Lint validé (`pnpm lint`)
- [ ] Build validé (`pnpm build`)
- [ ] Sécurité vérifiée (scan de dépendances + secrets, voir `ci.yml`)
- [ ] Migration validée sur staging AVANT production
- [ ] Backup de la base de production vérifié (restauration testée récemment — voir `docs/disaster-recovery.md`)
- [ ] Monitoring actif (voir section Monitoring ci-dessous)
- [ ] Rollback préparé (`docs/rollback.md` relu)
- [ ] Documentation mise à jour (`CHANGELOG.md`)

## RTO / RPO (Volume 8 §28)

| Métrique | Objectif cible | Statut |
|---|---|---|
| **RTO** (temps max. de restauration du service) | 4 heures | ⚠️ Non vérifié — aucun exercice de restauration réel effectué à ce jour |
| **RPO** (perte de données max. acceptable) | 24 heures | ⚠️ Dépend de la fréquence réelle des sauvegardes automatiques, à configurer selon l'hébergeur retenu |

**Ces chiffres sont des cibles proposées, pas des garanties vérifiées** —
Volume 8 §28 : "Ces objectifs doivent être réalistes par rapport à
l'infrastructure effectivement choisie", qui n'est pas encore arrêtée
(voir `docs/deployment.md`). À réviser dès le choix d'hébergeur fait, en
fonction de ses propres garanties de sauvegarde (ex. RDS PostgreSQL
propose des sauvegardes automatiques avec PITR jusqu'à 35 jours, ce qui
changerait le RPO réalisable).

## Déploiement

Push sur `main` → `deploy.yml` job `deploy-production` → **approbation
manuelle humaine requise** (GitHub Environment "production" avec Required
Reviewers configuré) → migration → déploiement → smoke tests
automatiques.

## Monitoring en production (Volume 8 §29, §33)

À surveiller : API (latence/erreurs), PostgreSQL (connexions/latence),
Redis (mémoire/latence), jobs BullMQ (bloqués/échoués), webhooks
(Stripe/Shopify — taux d'échec), paiements (échecs anormaux), Teddy
(latence/coût/taux de fallback sécurité). Aucun outil de monitoring n'est
câblé dans ce squelette — `/health/ready` et les logs structurés Pino
(voir `backend/src/config/logger.ts`) sont prêts à être scrapés par
l'outil retenu (Datadog/Grafana/Sentry — non tranché).

## Alertes recommandées (§33)

API indisponible, taux d'erreur > seuil, base/Redis inaccessible,
paiements en échec anormal, webhooks en échec répété, jobs bloqués >
durée seuil. **Éviter la fatigue d'alerte** : chaque alerte doit être
actionnable, pas simplement informative.

## Mobile (Volume 8 §37)

Builds gérés via EAS (`apps/mobile/eas.json`) — 3 profils : `development`
(client de dev interne), `staging` (build interne, canal `staging`),
`production` (soumission aux stores, canal `production`). Les identifiants
de soumission (`EXPO_APPLE_ID`, credentials Android) sont fournis via
variables d'environnement EAS (`eas secret:create`) — **jamais dans
`eas.json`**, qui reste commité et lisible par toute l'équipe.

## Rate limiting (§54)

Déjà implémenté (Volume 3, `middleware/rateLimit.middleware.ts`) —
limites différenciées à vérifier/ajuster par domaine avant charge réelle :
authentification (anti brute-force), API générale, Teddy (coût IA),
Voice/Vision (coût IA plus élevé), Admin, Webhooks.
