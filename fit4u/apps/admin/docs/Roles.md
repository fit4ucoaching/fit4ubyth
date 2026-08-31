# Roles — BackOffice ERP

## Les 8 rôles nommés (Volume 6)

| Rôle | Périmètre |
|---|---|
| **SUPER_ADMIN** | Accès total — reçoit automatiquement toutes les permissions, jamais listées explicitement (voir `Permissions.md`) |
| **ADMIN** | Gestion plateforme — tout sauf suppression de compte utilisateur et remboursement direct |
| **SUPPORT** | Support utilisateurs — lecture/écriture Utilisateurs (limité), Tickets, lecture VIP |
| **MODERATOR** | Communauté — modération de contenu, lecture Utilisateurs |
| **NUTRITION** | Contenus nutrition — lecture/écriture Nutrition uniquement |
| **COACH** | Programmes — lecture/écriture Programmes et Exercices |
| **MARKETING** | Campagnes — lecture Analytics, écriture Feature Flags, lecture Abonnements |
| **ANALYST** | Analytics uniquement — aucune écriture |

## Attribution d'un rôle

Un utilisateur reçoit un rôle via `PUT /admin/users/:id/role` (module
Utilisateurs) — un seul rôle actif à la fois (`UserRole` est recréé, pas
cumulé, pour éviter l'ambiguïté de permissions en cas de rôles multiples
aux périmètres qui se chevauchent). Le rôle "USER" (utilisateur final,
Volume 3) reste distinct des 8 rôles admin — un utilisateur "USER" n'a
accès à aucune route `/admin/*`.

## Résolution au login

Les permissions sont résolues depuis le(s) rôle(s) et embarquées dans le
token d'accès JWT à l'émission (login/refresh) — voir
`config/permissions.ts#getPermissionsForRoles()`. Un changement de rôle
par un administrateur prend effet au plus tard au prochain refresh token
(15 minutes par défaut), pas immédiatement sur les sessions déjà ouvertes
— compromis assumé pour éviter une requête DB sur chaque requête admin.
