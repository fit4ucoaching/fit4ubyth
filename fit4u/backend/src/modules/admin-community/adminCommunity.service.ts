import { NotFoundError } from "../../errors";
import { CommunityBanRepository } from "../../repositories/communityBan.repository";
import { auditLogService } from "../../services/auditLog.service";
import type { AdminCommunityRepository } from "./adminCommunity.repository";
import type { CreateBanInput, ListBansQuery, ListReportsQuery, ReviewReportInput } from "./adminCommunity.validators";

const communityBanRepository = new CommunityBanRepository();

/**
 * Centre de modération (Volume 6 : "Outils de modération rapide"). Traiter
 * un signalement en `ACTIONED` supprime le contenu concerné (soft delete)
 * ET journalise l'action — jamais une simple mise à jour de statut sans
 * effet réel, qui laisserait le contenu problématique visible.
 */
export class AdminCommunityService {
  constructor(private readonly repository: AdminCommunityRepository) {}

  listReports(query: ListReportsQuery) {
    return this.repository.listReports(query);
  }

  async getReportWithContent(reportId: string) {
    const report = await this.repository.findReportById(reportId);
    if (!report) throw new NotFoundError("Signalement introuvable.");
    const content = await this.repository.resolveReportedContent(report.targetType, report.targetId);
    return { report, content };
  }

  async reviewReport(adminId: string, reportId: string, input: ReviewReportInput) {
    const report = await this.repository.findReportById(reportId);
    if (!report) throw new NotFoundError("Signalement introuvable.");

    // "ACTIONED" retire réellement le contenu — jamais un statut sans effet.
    if (input.status === "ACTIONED") {
      if (report.targetType === "POST") await this.repository.softDeletePost(report.targetId);
      if (report.targetType === "COMMENT") await this.repository.softDeleteComment(report.targetId);
    }

    const updated = await this.repository.reviewReport(reportId, input.status, adminId);

    await auditLogService.record({
      performedBy: adminId,
      action: input.status === "ACTIONED" ? "REPORT_ACTIONED" : "REPORT_DISMISSED",
      targetType: "Report",
      targetId: reportId,
      after: { targetType: report.targetType, targetId: report.targetId },
    });

    return updated;
  }

  async banUser(adminId: string, input: CreateBanInput) {
    const ban = await communityBanRepository.create({
      userId: input.userId, reason: input.reason, bannedBy: adminId, expiresAt: input.expiresAt,
    });

    await auditLogService.record({
      performedBy: adminId,
      action: "COMMUNITY_BAN_ISSUED",
      targetType: "User",
      targetId: input.userId,
      after: { reason: input.reason, expiresAt: input.expiresAt, permanent: !input.expiresAt },
    });

    return ban;
  }

  async liftBan(adminId: string, banId: string) {
    const lifted = await communityBanRepository.lift(banId);

    await auditLogService.record({ performedBy: adminId, action: "COMMUNITY_BAN_LIFTED", targetType: "CommunityBan", targetId: banId });

    return lifted;
  }

  listBans(query: ListBansQuery) {
    return communityBanRepository.listBans(query);
  }
}
