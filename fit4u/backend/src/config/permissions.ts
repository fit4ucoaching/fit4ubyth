/**
 * Permissions granulaires (Volume 6 : "Créer un système RBAC. Permissions
 * granulaires."). Convention `<domaine>.<action>` — chaque route admin
 * sensible est protégée par une permission précise, jamais un simple
 * contrôle de rôle générique ("est admin ?" ne suffit plus dès qu'il existe
 * 8 rôles aux périmètres différents).
 */
export const PERMISSIONS = [
  "users.read", "users.write", "users.suspend", "users.delete",
  "vip.read", "vip.write",
  "teddy.read", "teddy.write",
  "exercises.read", "exercises.write",
  "programs.read", "programs.write",
  "nutrition.read", "nutrition.write",
  "shop.read", "shop.write",
  "payments.read", "payments.refund",
  "subscriptions.read", "subscriptions.write",
  "community.read", "community.moderate",
  "analytics.read",
  "support.read", "support.write",
  "settings.read", "settings.write",
  "monitoring.read",
  "backups.read", "backups.write",
  "audit.read",
  "feature_flags.read", "feature_flags.write",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Les 8 rôles nommés (Volume 6). `SUPER_ADMIN` reçoit toutes les
 * permissions automatiquement (voir `hasPermission()`) plutôt que de les
 * lister explicitement — évite d'oublier de lui accorder une permission
 * nouvellement créée.
 */
export const ADMIN_ROLE_NAMES = [
  "SUPER_ADMIN", "ADMIN", "SUPPORT", "MODERATOR",
  "NUTRITION", "COACH", "MARKETING", "ANALYST",
] as const;

export type AdminRoleName = (typeof ADMIN_ROLE_NAMES)[number];

export const ROLE_PERMISSIONS: Record<Exclude<AdminRoleName, "SUPER_ADMIN">, Permission[]> = {
  ADMIN: [
    "users.read", "users.write", "users.suspend",
    "vip.read", "vip.write",
    "teddy.read", "teddy.write",
    "exercises.read", "exercises.write",
    "programs.read", "programs.write",
    "nutrition.read", "nutrition.write",
    "shop.read", "shop.write",
    "payments.read",
    "subscriptions.read", "subscriptions.write",
    "community.read", "community.moderate",
    "analytics.read",
    "support.read", "support.write",
    "settings.read", "settings.write",
    "monitoring.read",
    "feature_flags.read", "feature_flags.write",
    "audit.read",
  ],
  SUPPORT: ["users.read", "users.write", "support.read", "support.write", "vip.read"],
  MODERATOR: ["community.read", "community.moderate", "users.read"],
  NUTRITION: ["nutrition.read", "nutrition.write"],
  COACH: ["programs.read", "programs.write", "exercises.read", "exercises.write"],
  MARKETING: ["analytics.read", "feature_flags.read", "feature_flags.write", "subscriptions.read"],
  ANALYST: ["analytics.read"],
};

/** `SUPER_ADMIN` a toujours toutes les permissions — jamais lu depuis `ROLE_PERMISSIONS`. */
export function getPermissionsForRoles(roleNames: string[]): Permission[] {
  if (roleNames.includes("SUPER_ADMIN")) {
    return [...PERMISSIONS];
  }
  const permissions = new Set<Permission>();
  for (const roleName of roleNames) {
    const rolePermissions = ROLE_PERMISSIONS[roleName as Exclude<AdminRoleName, "SUPER_ADMIN">];
    rolePermissions?.forEach((p) => permissions.add(p));
  }
  return [...permissions];
}
