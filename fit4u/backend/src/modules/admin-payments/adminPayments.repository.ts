import { BaseRepository } from "../../repositories/base.repository";
import { computeMonthlyRecurringRevenueCents } from "./mrrCalculation";

export class AdminPaymentsRepository extends BaseRepository {
  async getPaymentsOverview() {
    const since30d = new Date();
    since30d.setUTCDate(since30d.getUTCDate() - 30);

    const subscriptionBreakdownQuery = this.db.profile.groupBy({
      by: ["subscription"],
      orderBy: { subscription: "asc" },
      _count: { _all: true },
    });

    const [succeeded, failed, refunded, activeVip, totalUsers, subscriptionBreakdown, activeSubscriptions] = await this.db.$transaction([
      this.db.payment.aggregate({ where: { status: "PAID", createdAt: { gte: since30d } }, _sum: { amountCents: true }, _count: true }),
      this.db.payment.count({ where: { status: "FAILED", createdAt: { gte: since30d } } }),
      this.db.payment.aggregate({ where: { status: "REFUNDED", createdAt: { gte: since30d } }, _sum: { amountCents: true }, _count: true }),
      this.db.vipAccess.count({ where: { isActive: true } }),
      this.db.user.count({ where: { deletedAt: null } }),
      subscriptionBreakdownQuery,
      // MRR réel (Volume 7 §47 corrigé) : somme des prix exacts des
      // abonnements digitaux actifs, normalisée au mois. Remplace
      // l'ancienne heuristique (somme des paiements Boutique des 30
      // derniers jours, qui mélangeait à tort achats ponctuels et
      // abonnements récurrents — Volume 7 §40 : ne jamais confondre les deux).
      this.db.subscription.findMany({
        where: { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] }, priceId: { not: null } },
        include: { price: true },
      }),
    ]);

    const mrrCents = computeMonthlyRecurringRevenueCents(activeSubscriptions);

    return {
      last30Days: {
        succeededCount: succeeded._count,
        succeededAmountCents: succeeded._sum.amountCents ?? 0,
        failedCount: failed,
        refundedCount: refunded._count,
        refundedAmountCents: refunded._sum.amountCents ?? 0,
        totalUsers,
      },
      activeVip,
      subscriptionBreakdown: subscriptionBreakdown.map((s) => ({ subscription: s.subscription, count: s._count._all })),
      estimatedMrrCents: mrrCents,
      activeSubscriptionsCount: activeSubscriptions.length,
    };
  }

  async findPayments(params: { page: number; pageSize: number; status?: string }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { status: params.status as never };
    const [items, total] = await this.db.$transaction([
      this.db.payment.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { user: { include: { profile: true } } } }),
      this.db.payment.count({ where }),
    ]);
    return { items, total };
  }
}
