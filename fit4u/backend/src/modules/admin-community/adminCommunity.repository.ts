import { BaseRepository } from "../../repositories/base.repository";
import type { ListReportsQuery } from "./adminCommunity.validators";

export class AdminCommunityRepository extends BaseRepository {
  async listReports(query: ListReportsQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where = { status: query.status };
    const [items, total] = await this.db.$transaction([
      this.db.report.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { reporter: true, reviewer: true } }),
      this.db.report.count({ where }),
    ]);
    return { items, total };
  }

  findReportById(id: string) {
    return this.db.report.findUnique({ where: { id } });
  }

  reviewReport(id: string, status: "DISMISSED" | "ACTIONED", reviewedBy: string) {
    return this.db.report.update({ where: { id }, data: { status, reviewedBy, reviewedAt: new Date() } });
  }

  /** Résout le contenu signalé pour affichage admin — polymorphe selon `targetType` (voir schéma `Report`). */
  async resolveReportedContent(targetType: string, targetId: string) {
    switch (targetType) {
      case "POST":
        return this.db.post.findUnique({ where: { id: targetId }, include: { user: true } });
      case "COMMENT":
        return this.db.comment.findUnique({ where: { id: targetId }, include: { user: true } });
      case "USER":
        return this.db.user.findUnique({ where: { id: targetId }, include: { profile: true } });
      default:
        return null;
    }
  }

  softDeletePost(id: string) {
    return this.db.post.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  softDeleteComment(id: string) {
    return this.db.comment.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
