import { BaseRepository } from "../../repositories/base.repository";

export class AdminRepository extends BaseRepository {
  async getDashboardStats() {
    const since30d = new Date();
    since30d.setUTCDate(since30d.getUTCDate() - 30);

    const [totalUsers, newUsers30d, activeVip, totalOrders, revenueCents, openTickets] = await this.db.$transaction([
      this.db.user.count({ where: { deletedAt: null } }),
      this.db.user.count({ where: { createdAt: { gte: since30d } } }),
      this.db.vipAccess.count({ where: { isActive: true } }),
      this.db.order.count({ where: { status: { not: "CANCELLED" } } }),
      this.db.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { totalCents: true } }),
      this.db.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    ]);

    return {
      totalUsers,
      newUsers30d,
      activeVip,
      totalOrders,
      totalRevenueCents: revenueCents._sum.totalCents ?? 0,
      openTickets,
    };
  }

  logAction(params: { performedBy: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown> }) {
    return this.db.adminLog.create({ data: params });
  }

  createTicket(userId: string, subject: string, priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT") {
    return this.db.supportTicket.create({ data: { userId, subject, priority } });
  }

  addTicketMessage(ticketId: string, senderId: string, content: string, isInternalNote: boolean) {
    return this.db.supportMessage.create({ data: { ticketId, senderId, content, isInternalNote } });
  }

  findTicketById(id: string) {
    return this.db.supportTicket.findFirst({
      where: { id, deletedAt: null },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  async findTickets(params: { page: number; pageSize: number; status?: string }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { deletedAt: null, status: params.status as never };
    const [items, total] = await this.db.$transaction([
      this.db.supportTicket.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.db.supportTicket.count({ where }),
    ]);
    return { items, total };
  }

  updateTicketStatus(id: string, status: string, assignedTo?: string) {
    return this.db.supportTicket.update({ where: { id }, data: { status: status as never, assignedTo } });
  }

  upsertSetting(key: string, value: unknown, description?: string) {
    return this.db.systemSetting.upsert({
      where: { key },
      create: { key, value: value as object, description },
      update: { value: value as object, description },
    });
  }

  listSettings() {
    return this.db.systemSetting.findMany({ orderBy: { key: "asc" } });
  }

  upsertFeatureFlag(params: {
    key: string;
    isEnabled: boolean;
    rolloutPercentage: number;
    description?: string;
    targetAudience: string;
    targetCountries: string[];
    targetMinVersion?: string;
    isBeta: boolean;
  }) {
    return this.db.featureFlag.upsert({
      where: { key: params.key },
      create: params,
      update: params,
    });
  }

  listFeatureFlags() {
    return this.db.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  /** Import CSV VIP en masse (Volume 6) — une ligne = une adresse email à créditer. */
  async bulkGrantVip(params: {
    emails: { email: string; note?: string }[];
    isLifetime: boolean;
    endDate?: Date;
    createdBy: string;
  }) {
    const now = new Date();
    return this.db.vipAccess.createMany({
      data: params.emails.map((e) => ({
        email: e.email,
        note: e.note,
        isLifetime: params.isLifetime,
        startDate: now,
        endDate: params.endDate,
        createdBy: params.createdBy,
      })),
      skipDuplicates: true,
    });
  }
}
