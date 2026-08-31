import type { AccessLevel } from "../config/accessLevels";
import { isAtLeast } from "../config/accessLevels";
import { EntitlementRepository } from "../repositories/entitlement.repository";
import { VipAccessRepository } from "../repositories/vipAccess.repository";

const entitlementRepository = new EntitlementRepository();
const vipAccessRepository = new VipAccessRepository();

export interface EntitlementContext {
  userId: string;
  roles: string[];
}

export interface EntitlementSummary {
  accessLevel: AccessLevel;
  source: "role" | "vip" | "subscription" | "default";
  features: { key: string; granted: boolean }[];
}

/**
 * Entitlement Engine (Volume 7 §11) — SOURCE UNIQUE DE VÉRITÉ des droits
 * applicatifs. "Le système de paiement ne doit pas être directement
 * responsable de l'autorisation des fonctionnalités" : ce service ne
 * connaît ni Stripe ni PayPal, uniquement les faits déjà persistés
 * (rôles RBAC, VIP, abonnement actif). Vérifié FRAÎCHEMENT à chaque appel
 * (pas de cache JWT) — contrairement aux permissions RBAC (Volume 6), un
 * changement d'abonnement doit être immédiatement reflété : un paiement
 * qui vient de réussir ne doit jamais attendre un refresh token pour
 * débloquer l'accès.
 *
 * Priorité (Volume 7 §12, configurable — voir `config/accessLevels.ts`) :
 * ADMIN > VIP > PRO > PREMIUM > FREE.
 */
export const entitlementService = {
  /** Résout le niveau d'accès le plus élevé auquel l'utilisateur a droit, tous statuts confondus. */
  async resolveAccessLevel(context: EntitlementContext): Promise<{ level: AccessLevel; source: EntitlementSummary["source"] }> {
    if (context.roles.some((r) => r === "ADMIN" || r === "SUPER_ADMIN")) {
      return { level: "ADMIN", source: "role" };
    }

    const email = await entitlementRepository.findUserEmail(context.userId);
    const vipAccess = email ? await vipAccessRepository.findActiveByEmail(email) : null;
    if (vipAccess) {
      return { level: "VIP", source: "vip" };
    }

    const subscription = await entitlementRepository.findActiveSubscription(context.userId);
    if (subscription) {
      return { level: subscription.plan.accessLevel, source: "subscription" };
    }

    return { level: "FREE", source: "default" };
  },

  /**
   * Vérifie l'accès à UNE fonctionnalité précise. "Fail closed" : une clé de
   * fonctionnalité inconnue ou désactivée est TOUJOURS refusée plutôt que
   * silencieusement autorisée — une fonctionnalité mal configurée ne doit
   * jamais devenir accidentellement gratuite pour tous.
   */
  async hasFeature(context: EntitlementContext, featureKey: string): Promise<boolean> {
    const feature = await entitlementRepository.findFeatureDefinition(featureKey);
    if (!feature || !feature.isActive) return false;

    const { level } = await this.resolveAccessLevel(context);
    return isAtLeast(level, feature.minimumLevel as AccessLevel);
  },

  /** Résumé complet — consommé par le frontend pour l'affichage conditionnel (jamais pour l'autorisation elle-même). */
  async getSummary(context: EntitlementContext): Promise<EntitlementSummary> {
    const { level, source } = await this.resolveAccessLevel(context);
    const definitions = await entitlementRepository.listFeatureDefinitions();

    return {
      accessLevel: level,
      source,
      features: definitions
        .filter((f) => f.isActive)
        .map((f) => ({ key: f.key, granted: isAtLeast(level, f.minimumLevel as AccessLevel) })),
    };
  },

  listFeatureDefinitions() {
    return entitlementRepository.listFeatureDefinitions();
  },

  upsertFeatureDefinition(params: { key: string; description?: string; minimumLevel: AccessLevel; isActive: boolean }) {
    return entitlementRepository.upsertFeatureDefinition(params);
  },
};
