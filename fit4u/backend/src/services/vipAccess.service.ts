import { VipAccessRepository } from "../repositories/vipAccess.repository";

const vipAccessRepository = new VipAccessRepository();

export interface VipResolution {
  isVip: boolean;
  vipAccessId?: string;
}

/**
 * Service dédié VIP (Volume 3) — appelé systématiquement à l'authentification
 * (login, register, refresh) par `modules/auth`. Une adresse email présente
 * et active dans `vip_access` obtient automatiquement `subscription = VIP`
 * et `premium = true`, quelle que soit la valeur stockée sur `Profile`.
 *
 * Source de vérité : la table `vip_access` prime toujours sur
 * `Profile.subscription` pour la résolution du statut Premium — un
 * administrateur peut retirer l'accès à tout moment (`isActive = false`)
 * sans avoir à modifier chaque profil utilisateur individuellement.
 */
export const vipAccessService = {
  async resolveForEmail(email: string, userId: string): Promise<VipResolution> {
    const vipAccess = await vipAccessRepository.findActiveByEmail(email);

    if (!vipAccess) {
      return { isVip: false };
    }

    // Lie automatiquement le compte VIP au userId dès la première connexion
    // détectée (permet d'accorder l'accès avant même l'inscription — voir
    // docs/DATABASE_ARCHITECTURE.md §4.12).
    if (!vipAccess.userId) {
      await vipAccessRepository.linkUserId(vipAccess.id, userId);
    }

    return { isVip: true, vipAccessId: vipAccess.id };
  },

  grant(params: {
    email: string;
    userId?: string;
    isLifetime: boolean;
    startDate: Date;
    endDate?: Date;
    note?: string;
    createdBy: string;
  }) {
    return vipAccessRepository.create(params);
  },

  revoke(id: string) {
    return vipAccessRepository.revoke(id);
  },

  list(params: { page: number; pageSize: number }) {
    return vipAccessRepository.findMany(params);
  },
};
