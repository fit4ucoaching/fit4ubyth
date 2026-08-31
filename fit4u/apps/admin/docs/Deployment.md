# Deployment — BackOffice ERP

## Isolation stricte

`apps/admin` est déployé **séparément** de `apps/web` — domaines distincts
recommandés (ex. `admin.fit4u.app` vs `app.fit4u.app`), jamais le même
build. Les deux communiquent avec le même backend (`/api/v1`) mais
`apps/admin` cible exclusivement le préfixe `/admin` de ce backend.

Sessions non partagées : `tokenStorage.ts` utilise des clés localStorage
préfixées `fit4u_admin_*`, distinctes de `fit4u_*` (web) — se connecter à
l'un ne connecte pas l'autre, et un token web ne fonctionne jamais sur
`/admin/*` (le rôle "USER" n'a aucune permission admin).

## Variables d'environnement

Voir `.env.example` — `VITE_API_URL` doit pointer vers le même backend que
`apps/web`, avec le préfixe `/api/v1` inclus.

## Recommandations de production (non implémentées dans ce squelette)

- **Restriction d'accès réseau** : IP allowlist ou VPN devant `apps/admin`
  — un BackOffice avec accès total à la plateforme ne devrait pas être
  exposé publiquement au même titre que l'app utilisateur.
- **MFA obligatoire** pour les rôles `SUPER_ADMIN`/`ADMIN` — non construit
  au Volume 3 (l'auth actuelle est email/mot de passe + OAuth, sans 2FA).
- **Rate limiting renforcé** sur `/admin/*` — le rate limiting Volume 3
  existe globalement mais mériterait un seuil plus strict sur les routes
  d'écriture sensibles (`vip.write`, `users.delete`).
- **Alerting** sur les actions `SUPER_ADMIN` sensibles (changement de
  rôle, suppression de compte) — brancher `auditLogService.record()` sur
  une notification Slack/email en plus de la persistance en base.

## Build

```bash
pnpm --filter @fit4u/admin build
```

Produit un bundle statique (`dist/`) servable par tout hébergeur statique
(Vercel, Netlify, Nginx) — aucune particularité serveur, l'app est 100%
côté client (SPA React Router).
