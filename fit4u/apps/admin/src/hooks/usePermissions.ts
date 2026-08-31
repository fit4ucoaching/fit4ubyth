import { useAuthStore } from "../store/authStore";

/**
 * Hook de permission (Volume 6 RBAC) — source de vérité unique pour
 * afficher/masquer une section ou désactiver une action selon les
 * permissions du token. Le contrôle réel reste TOUJOURS côté serveur
 * (chaque route `/admin/*` vérifie `requirePermission()`) : ce hook ne sert
 * qu'à l'expérience utilisateur (ne pas montrer un bouton qui échouerait).
 */
export function usePermissions() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);

  return {
    permissions,
    can: (permission: string) => permissions.includes(permission),
    canAny: (...perms: string[]) => perms.some((p) => permissions.includes(p)),
  };
}
