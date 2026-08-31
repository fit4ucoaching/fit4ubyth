import { auditLogService } from "../../services/auditLog.service";
import type { PrivacyRepository } from "./privacy.repository";

/**
 * Service RGPD (Volume 8 §58) — export et suppression de compte.
 * "Distinguer les données nécessaires au fonctionnement des données
 * facultatives" : l'anonymisation (voir repository) conserve les données
 * financières (obligations comptables, Volume 7 §41 : "ne jamais supprimer
 * les événements financiers nécessaires à l'audit") tout en retirant les
 * données personnelles identifiantes.
 */
export class PrivacyService {
  constructor(private readonly repository: PrivacyRepository) {}

  exportData(userId: string) {
    return this.repository.exportUserData(userId);
  }

  async deleteAccount(userId: string) {
    const result = await this.repository.anonymizeUser(userId);
    await auditLogService.record({
      performedBy: userId,
      action: "ACCOUNT_DELETION_REQUESTED",
      targetType: "User",
      targetId: userId,
    });
    return result;
  }
}
