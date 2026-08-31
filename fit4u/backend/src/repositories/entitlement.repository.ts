import { BaseRepository } from "./base.repository";

export class EntitlementRepository extends BaseRepository {
  /** Résolution légère de l'email — évite d'alourdir le JWT (Volume 6) d'un champ supplémentaire pour ce seul besoin. */
  async findUserEmail(userId: string): Promise<string | null> {
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { email: true } });
    return user?.email ?? null;
  }

  /** Abonnement actif d'un utilisateur — statuts considérés "en accès" (Volume 7 §17-18). */
  findActiveSubscription(userId: string) {
    return this.db.subscription.findFirst({
      where: {
        userId,
        status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] },
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findFeatureDefinition(key: string) {
    return this.db.featureDefinition.findUnique({ where: { key } });
  }

  listFeatureDefinitions() {
    return this.db.featureDefinition.findMany({ orderBy: { key: "asc" } });
  }

  upsertFeatureDefinition(params: { key: string; description?: string; minimumLevel: string; isActive: boolean }) {
    return this.db.featureDefinition.upsert({
      where: { key: params.key },
      create: params as never,
      update: params as never,
    });
  }
}
