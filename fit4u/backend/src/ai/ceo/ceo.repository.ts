import { BaseRepository } from "../../repositories/base.repository";

/**
 * Requêtes plateforme dédiées au Teddy CEO — jamais de données
 * individuelles au-delà de ce qui est strictement nécessaire (ex.
 * `getChurnRiskUsers` renvoie des emails, jamais l'historique complet
 * d'un utilisateur, qui resterait consultable uniquement via la fiche
 * utilisateur classique — Volume 6).
 */
export class CeoRepository extends BaseRepository {
  async getKPISummary() {
    const since30d = new Date();
    since30d.setUTCDate(since30d.getUTCDate() - 30);

    const [totalUsers, newUsers30d, activeVip, activeSubscriptions, revenue30d, openTickets] = await this.db.$transaction([
      this.db.user.count({ where: { deletedAt: null } }),
      this.db.user.count({ where: { deletedAt: null, createdAt: { gte: since30d } } }),
      this.db.vipAccess.count({ where: { isActive: true } }),
      this.db.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } } }),
      this.db.payment.aggregate({ where: { status: "PAID", createdAt: { gte: since30d } }, _sum: { amountCents: true } }),
      this.db.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    ]);

    return {
      totalUsers,
      newUsers30d,
      activeVip,
      activeSubscriptions,
      totalRevenueCents30d: revenue30d._sum.amountCents ?? 0,
      openSupportTickets: openTickets,
    };
  }

  /** Comptage de séances complétées sur une fenêtre — réutilisé pour la comparaison de périodes (`DetectAnomalies`). */
  async getCompletedWorkoutsCount(since: Date, until: Date) {
    return this.db.workoutSession.count({ where: { status: "COMPLETED", completedAt: { gte: since, lt: until } } });
  }

  async getRevenueCents(since: Date, until: Date) {
    const result = await this.db.payment.aggregate({ where: { status: "PAID", createdAt: { gte: since, lt: until } }, _sum: { amountCents: true } });
    return result._sum.amountCents ?? 0;
  }

  async getNewUsersCount(since: Date, until: Date) {
    return this.db.user.count({ where: { deletedAt: null, createdAt: { gte: since, lt: until } } });
  }

  /** Abonnés actifs sans séance depuis `inactivityDays` — heuristique simple de risque de résiliation. */
  async getChurnRiskUsers(inactivityDays: number, limit = 20) {
    const threshold = new Date();
    threshold.setUTCDate(threshold.getUTCDate() - inactivityDays);

    const activeSubscriptions = await this.db.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { user: true },
      take: 200, // borne large pré-filtrage — évite de charger toute la table sur une plateforme à forte volumétrie
    });

    const results = await Promise.all(
      activeSubscriptions.map(async (sub) => {
        const lastSession = await this.db.workoutSession.findFirst({
          where: { userId: sub.userId, status: "COMPLETED" },
          orderBy: { completedAt: "desc" },
        });
        const lastActivity = lastSession?.completedAt ?? sub.createdAt;
        return { userId: sub.userId, email: sub.user.email, lastActivity, subscriptionStatus: sub.status };
      }),
    );

    return results
      .filter((r) => r.lastActivity < threshold)
      .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
      .slice(0, limit)
      .map((r) => ({
        userId: r.userId,
        email: r.email,
        daysSinceLastActivity: Math.floor((Date.now() - r.lastActivity.getTime()) / (24 * 60 * 60 * 1000)),
        subscriptionStatus: r.subscriptionStatus,
      }));
  }

  async getTopPerformingPrograms(limit: number) {
    const grouped = await this.db.workoutSession.groupBy({
      by: ["programId"],
      where: { status: "COMPLETED", programId: { not: null } },
      _count: true,
      orderBy: { _count: { programId: "desc" } },
      take: limit,
    });

    const programIds = grouped.map((g) => g.programId).filter((id): id is string => id !== null);
    const programs = await this.db.program.findMany({ where: { id: { in: programIds } } });
    const nameById = new Map(programs.map((p) => [p.id, p.name]));

    return grouped.map((g) => ({
      programId: g.programId!,
      programName: nameById.get(g.programId!) ?? "Programme supprimé",
      completedSessionsCount: g._count,
    }));
  }
}
