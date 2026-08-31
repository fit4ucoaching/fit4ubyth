# Télémétrie & RGPD — Fit4U by TH (Volume 8 §57-59)

## Statut

**Non implémenté** (aucun SDK analytics câblé) — ce document définit le
catalogue d'événements attendu, pour qu'une future intégration
(Amplitude/Mixpanel/PostHog/interne) l'implémente de façon cohérente
plutôt que d'inventer des noms d'événements au fil de l'eau.

## Catalogue d'événements (§57)

| Événement | Déclenché quand | Données incluses |
|---|---|---|
| `USER_SIGNED_UP` | Inscription réussie | `userId`, méthode (email/Google/Apple) |
| `WORKOUT_STARTED` | `POST /workouts/start` réussi | `userId`, `programId?`, nombre d'exercices |
| `WORKOUT_COMPLETED` | `POST /workouts/finish` réussi | `userId`, `durationSeconds`, `caloriesBurned` |
| `TEDDY_MESSAGE_SENT` | `POST /teddy/chat` | `userId`, domaine détecté (jamais le contenu du message) |
| `PREMIUM_STARTED` | `Subscription` passe à `ACTIVE` (webhook) | `userId`, `planKey` |
| `VIP_GRANTED` | `POST /admin/vip` réussi | `adminId`, email bénéficiaire (jamais loggé en clair dans un outil tiers non conforme RGPD) |
| `PRODUCT_PURCHASED` | `Order` passe à `PROCESSING` | `userId`, `orderId`, montant |

## Principe (§57)

"Chaque événement analytics doit être défini" — n'ajouter un événement à
ce catalogue qu'après validation explicite de son utilité, jamais par
défaut sur chaque action utilisateur. "Respecter les préférences de
confidentialité" — un événement ne doit jamais être envoyé à un outil
tiers si l'utilisateur a retiré son consentement analytics (mécanisme de
consentement à construire, voir ci-dessous).

## RGPD (§58 — voir aussi `backend/src/modules/privacy/`)

| Mécanisme | Statut |
|---|---|
| Export des données | ✅ Implémenté — `GET /api/v1/privacy/export` |
| Suppression de compte | ✅ Implémenté — `DELETE /api/v1/privacy/account` (anonymisation) |
| Gestion des consentements | ❌ Non implémenté — aucune table `UserConsent` au schéma |
| Retrait des consentements | ❌ Non implémenté (dépend du point précédent) |

## Rétention des données (§59)

Aucune politique de purge automatique n'est implémentée. Recommandation
par catégorie (à valider juridiquement avant mise en œuvre) :

| Catégorie | Rétention suggérée |
|---|---|
| Logs applicatifs (Pino) | 30-90 jours selon le volume/coût de stockage |
| `WebhookEvent` (Volume 7) | 90 jours (au-delà, l'idempotence n'a plus d'utilité pratique) |
| `AdminLog` (audit, Volume 6) | Conservation longue (obligation de traçabilité) — jamais purgé automatiquement |
| Comptes anonymisés (`deleteAccount`) | Conservation indéfinie des données financières (obligation comptable), le reste déjà anonymisé |
| Conversations Teddy (`AIMessage`) | Non défini — à trancher avec le fondateur (utilité produit vs minimisation RGPD) |
