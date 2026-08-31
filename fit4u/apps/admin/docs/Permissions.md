# Permissions — BackOffice ERP

## Convention

`<domaine>.<action>` — jamais un contrôle de rôle générique une fois
qu'il existe 8 rôles aux périmètres différents. Voir
`backend/src/config/permissions.ts#PERMISSIONS` pour la liste exhaustive
(31 permissions au total).

## Exemples (Volume 6)

| Permission | Usage |
|---|---|
| `users.read` | Voir la liste et la fiche utilisateur |
| `users.write` | Modifier rôle/Premium d'un utilisateur |
| `users.suspend` | Suspendre/réactiver un compte |
| `users.delete` | Supprimer (soft delete) un compte |
| `vip.write` | Accorder/révoquer/importer des accès VIP |
| `payments.read` | Voir le dashboard Paiements |
| `payments.refund` | Déclencher un remboursement (non câblé ce volume — voir `Modules.md`) |
| `teddy.write` | Modifier la configuration Teddy (Control Center — non câblé ce volume) |
| `analytics.read` | Voir Dashboard et Analytics |
| `settings.write` | Modifier les paramètres système |

## Application

Chaque route sensible du backend porte `requirePermission("<permission>")`
(voir `middleware/auth.middleware.ts`) — jamais une vérification de
permission uniquement côté frontend. `hooks/usePermissions.ts` (frontend)
sert uniquement à l'expérience utilisateur (masquer un bouton qui
échouerait), le contrôle réel et systématique est serveur.

## Étendre les permissions

1. Ajouter la permission à `PERMISSIONS` (backend).
2. L'ajouter aux rôles concernés dans `ROLE_PERMISSIONS`.
3. Poser `requirePermission()` sur la route backend correspondante.
4. Utiliser `usePermissions().can("...")` côté frontend pour l'affichage conditionnel.
5. Documenter ici.

`SUPER_ADMIN` n'a jamais besoin d'être ajouté explicitement à
`ROLE_PERMISSIONS` — il reçoit automatiquement toute nouvelle permission
créée (voir `getPermissionsForRoles()`).
