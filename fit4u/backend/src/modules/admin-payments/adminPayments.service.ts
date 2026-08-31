import type { AdminPaymentsRepository } from "./adminPayments.repository";

/**
 * Vue d'ensemble Paiements (Volume 6 : "MRR, ARR, LTV, Taux de
 * conversion"). Le MRR est désormais calculé à partir des abonnements
 * digitaux réellement actifs et de leur `SubscriptionPrice` exact
 * (normalisé au mois pour les abonnements annuels) — voir
 * `adminPayments.repository.ts#getPaymentsOverview()`. Corrigé au fil de
 * la revue continue : l'ancienne version sommait les paiements Boutique
 * des 30 derniers jours, mélangeant à tort achats ponctuels et abonnements
 * récurrents (Volume 7 §40).
 */
export class AdminPaymentsService {
  constructor(private readonly repository: AdminPaymentsRepository) {}

  async overview() {
    const data = await this.repository.getPaymentsOverview();
    const mrrCents = data.estimatedMrrCents;
    const totalUsers = data.last30Days.totalUsers || 1;
    const payingUsers = data.subscriptionBreakdown
      .filter((s) => s.subscription !== "FREE")
      .reduce((sum, s) => sum + s.count, 0);

    return {
      mrrCents,
      arrCents: mrrCents * 12,
      activeVip: data.activeVip,
      activeSubscriptionsCount: data.activeSubscriptionsCount,
      conversionRate: payingUsers / totalUsers,
      last30Days: data.last30Days,
      subscriptionBreakdown: data.subscriptionBreakdown,
    };
  }

  findPayments(params: { page: number; pageSize: number; status?: string }) {
    return this.repository.findPayments(params);
  }
}
