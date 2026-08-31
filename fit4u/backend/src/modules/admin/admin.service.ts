import { NotFoundError } from "../../errors";
import { AIRepository } from "../../ai/ai.repository";
import { backupQueue } from "../../jobs/queue";
import { auditLogService } from "../../services/auditLog.service";
import { vipAccessService } from "../../services/vipAccess.service";
import { shopifyService } from "../../shopify/shopify.service";
import type { AdminRepository } from "./admin.repository";
import type {
  GrantVipInput,
  ImportVipCsvInput,
  UpsertFeatureFlagInput,
  UpsertSettingInput,
} from "./admin.validators";

const aiRepository = new AIRepository();

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  dashboard() {
    return this.adminRepository.getDashboardStats();
  }

  /** Coûts Teddy (Volume 8 §53) — agrégat sur une fenêtre glissante, jamais le contenu des conversations elles-mêmes. */
  async teddyCostSummary(sinceDays: number) {
    const sinceDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
    const [row] = await aiRepository.getTeddyCostSummary(sinceDate);
    return {
      periodDays: sinceDays,
      totalMessages: Number(row?.total_messages ?? 0),
      totalTokens: Number(row?.total_tokens ?? 0),
      estimatedCostUsd: Number(row?.total_cost_micro_usd ?? 0) / 1_000_000,
    };
  }

  async grantVip(adminId: string, input: GrantVipInput) {
    const result = await vipAccessService.grant({
      email: input.email,
      isLifetime: input.isLifetime,
      startDate: new Date(),
      endDate: input.endDate,
      note: input.note,
      createdBy: adminId,
    });
    await this.adminRepository.logAction({
      performedBy: adminId,
      action: "VIP_GRANTED",
      targetType: "VipAccess",
      targetId: result.id,
      metadata: { email: input.email },
    });
    return result;
  }

  async revokeVip(adminId: string, vipAccessId: string) {
    const result = await vipAccessService.revoke(vipAccessId);
    await this.adminRepository.logAction({
      performedBy: adminId,
      action: "VIP_REVOKED",
      targetType: "VipAccess",
      targetId: vipAccessId,
    });
    return result;
  }

  listVip(params: { page: number; pageSize: number }) {
    return vipAccessService.list(params);
  }

  /**
   * Import CSV VIP en masse (Volume 6). Format attendu : une adresse email
   * par ligne, avec une note optionnelle séparée par une virgule
   * (`email,note`). Les lignes invalides sont ignorées et comptabilisées
   * plutôt que de faire échouer tout l'import.
   */
  async importVipCsv(adminId: string, input: ImportVipCsvInput) {
    const lines = input.csvContent.split("\n").map((l) => l.trim()).filter(Boolean);
    const emails: { email: string; note?: string }[] = [];
    let invalidCount = 0;

    for (const line of lines) {
      const [emailPart, ...noteParts] = line.split(",");
      const email = emailPart?.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emails.push({ email, note: noteParts.join(",").trim() || undefined });
      } else {
        invalidCount += 1;
      }
    }

    const result = await this.adminRepository.bulkGrantVip({
      emails,
      isLifetime: input.isLifetime,
      endDate: input.endDate,
      createdBy: adminId,
    });

    await auditLogService.record({
      performedBy: adminId,
      action: "VIP_BULK_IMPORTED",
      targetType: "VipAccess",
      after: { importedCount: result.count, invalidCount, totalLines: lines.length },
    });

    return { importedCount: result.count, invalidCount, totalLines: lines.length };
  }

  tickets(params: { page: number; pageSize: number; status?: string }) {
    return this.adminRepository.findTickets(params);
  }

  async replyTicket(adminId: string, ticketId: string, content: string, isInternalNote: boolean) {
    const ticket = await this.adminRepository.findTicketById(ticketId);
    if (!ticket) throw new NotFoundError("Ticket introuvable.");
    return this.adminRepository.addTicketMessage(ticketId, adminId, content, isInternalNote);
  }

  async updateTicketStatus(ticketId: string, status: string, assignedTo?: string) {
    const ticket = await this.adminRepository.findTicketById(ticketId);
    if (!ticket) throw new NotFoundError("Ticket introuvable.");
    return this.adminRepository.updateTicketStatus(ticketId, status, assignedTo);
  }

  settings() {
    return this.adminRepository.listSettings();
  }

  upsertSetting(adminId: string, input: UpsertSettingInput) {
    void adminId;
    return this.adminRepository.upsertSetting(input.key, input.value, input.description);
  }

  featureFlags() {
    return this.adminRepository.listFeatureFlags();
  }

  upsertFeatureFlag(input: UpsertFeatureFlagInput) {
    return this.adminRepository.upsertFeatureFlag(input);
  }

  /** Journal d'audit (Volume 6) — qui/quand/quoi/avant/après/IP/appareil. */
  auditLogs(params: { page: number; pageSize: number; action?: string; targetType?: string; performedBy?: string }) {
    return auditLogService.list(params);
  }

  /**
   * Sauvegardes (Volume 6) — déclenche immédiatement `backupQueue`
   * (Volume 3, planifiée par ailleurs tous les jours à 03h00 UTC). La
   * restauration réelle depuis un snapshot dépend du provider
   * d'infrastructure (RDS/GCS) — non exécutable depuis l'application elle-même,
   * documentée comme point d'intégration dans docs/Modules.md.
   */
  async triggerBackup(adminId: string) {
    const job = await backupQueue.add("manual-backup", { triggeredBy: adminId });
    await auditLogService.record({ performedBy: adminId, action: "BACKUP_TRIGGERED", targetType: "Backup", targetId: job.id });
    return { jobId: job.id, status: "queued" };
  }

  async backupHistory() {
    const jobs = await backupQueue.getJobs(["completed", "failed", "active", "waiting"], 0, 20);
    return jobs.map((job) => ({
      id: job.id,
      status: job.finishedOn ? (job.failedReason ? "failed" : "completed") : "pending",
      triggeredAt: new Date(job.timestamp).toISOString(),
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    }));
  }

  /** Synchronisation manuelle du catalogue Shopify (Volume 7 §31) — journalisée comme toute action admin. */
  async syncShopify(adminId: string) {
    const result = await shopifyService.syncProducts();
    await auditLogService.record({
      performedBy: adminId,
      action: "SHOPIFY_CATALOG_SYNCED",
      targetType: "Product",
      after: { syncedCount: result.syncedCount },
    });
    return result;
  }
}
