import { AuditLogRepository, type CreateAuditLogInput } from "../repositories/auditLog.repository";

const auditLogRepository = new AuditLogRepository();

/**
 * Service d'audit (Volume 6) — façade unique utilisée par tous les modules
 * admin pour journaliser une action sensible. Enregistre systématiquement
 * qui / quand / quoi / avant / après / IP / appareil, jamais un sous-ensemble
 * partiel selon le module appelant.
 */
export const auditLogService = {
  record(input: CreateAuditLogInput) {
    return auditLogRepository.create(input);
  },

  list(params: { page: number; pageSize: number; action?: string; targetType?: string; performedBy?: string }) {
    return auditLogRepository.findMany(params);
  },
};
