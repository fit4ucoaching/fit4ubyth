# Staging — Fit4U by TH

## Objectif

Environnement de validation avant production — données de test
uniquement, jamais de données utilisateur réelles. Comptes de paiement
Stripe/PayPal en mode TEST exclusivement.

## Déploiement

Automatique à chaque push sur `develop` (voir `.github/workflows/deploy.yml`,
job `deploy-staging`). Étapes :

1. Build de l'image backend
2. Application des migrations Prisma (`prisma migrate deploy`)
3. Déploiement de la nouvelle version
4. Smoke tests automatiques (§47) : `/health`, `/health/ready`, endpoint
   d'authentification, documentation OpenAPI exposée

## Variables d'environnement Staging

Distinctes de production — stockées comme secrets/variables de
l'environnement GitHub "staging" (Settings → Environments), jamais dans
le code. Voir `backend/.env.example` pour la liste exhaustive des clés
attendues.

## Accès

Réservé à l'équipe et aux bêta-testeurs désignés (voir le système Labs,
Volume 8 §56) — non indexé publiquement, protégé par un accès restreint
(à définir selon l'hébergeur retenu : IP allowlist, Basic Auth, ou VPN).

## Avant promotion vers production

- [ ] Smoke tests staging passés
- [ ] Tests E2E critiques exécutés manuellement sur staging (voir `docs/PROJECT_STATUS.md`)
- [ ] Aucune régression signalée depuis le dernier déploiement staging
- [ ] Migration testée sur staging AVANT d'être appliquée en production (Volume 8 §24)
