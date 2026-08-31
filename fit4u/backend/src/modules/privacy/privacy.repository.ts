import { BaseRepository } from "../../repositories/base.repository";

/**
 * Export/suppression RGPD (Volume 8 §58) — un seul repository dédié plutôt
 * que de disperser des requêtes d'export dans chaque module métier :
 * centralise la liste exhaustive des tables contenant des données
 * personnelles, pour qu'une nouvelle table ajoutée par erreur à l'oubli
 * soit visible en un seul endroit du code.
 */
export class PrivacyRepository extends BaseRepository {
  async exportUserData(userId: string) {
    const [
      user, profile, preferences, goals, weightHistory, measurements,
      workoutSessions, personalRecords, favoriteExercises, mealPlans,
      waterLogs, badges, userChallenges, posts, comments, orders,
      payments, subscriptions, aiConversations, notificationSettings,
    ] = await this.db.$transaction([
      this.db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, createdAt: true, status: true } }),
      this.db.profile.findUnique({ where: { userId } }),
      this.db.userPreference.findUnique({ where: { userId } }),
      this.db.goal.findMany({ where: { userId } }),
      this.db.weightHistory.findMany({ where: { userId } }),
      this.db.measurement.findMany({ where: { userId } }),
      this.db.workoutSession.findMany({ where: { userId } }),
      this.db.personalRecord.findMany({ where: { userId } }),
      this.db.favoriteExercise.findMany({ where: { userId } }),
      this.db.mealPlan.findMany({ where: { userId } }),
      this.db.waterTracking.findMany({ where: { userId } }),
      this.db.userBadge.findMany({ where: { userId } }),
      this.db.userChallenge.findMany({ where: { userId } }),
      this.db.post.findMany({ where: { userId } }),
      this.db.comment.findMany({ where: { userId } }),
      this.db.order.findMany({ where: { userId } }),
      this.db.payment.findMany({ where: { userId } }),
      this.db.subscription.findMany({ where: { userId } }),
      this.db.aIConversation.findMany({ where: { userId }, include: { messages: true } }),
      this.db.notificationSetting.findMany({ where: { userId } }),
    ]);

    return {
      user, profile, preferences, goals, weightHistory, measurements,
      workoutSessions, personalRecords, favoriteExercises, mealPlans,
      waterLogs, badges, userChallenges, posts, comments, orders,
      payments, subscriptions, aiConversations, notificationSettings,
    };
  }

  /**
   * Anonymisation plutôt que suppression physique (Volume 8 §58-59) —
   * conserve l'intégrité référentielle des données financières/commandes
   * (obligations comptables) tout en retirant les données personnelles
   * identifiantes. L'email est remplacé par une valeur non réversible pour
   * permettre une future ré-inscription avec la même adresse.
   */
  async anonymizeUser(userId: string) {
    const anonymizedEmail = `deleted-${userId}@anonymized.fit4u.invalid`;
    return this.db.$transaction([
      this.db.user.update({ where: { id: userId }, data: { email: anonymizedEmail, status: "DELETED", deletedAt: new Date() } }),
      this.db.profile.update({
        where: { userId },
        data: { firstName: "Utilisateur", lastName: "Supprimé", avatarUrl: null, bio: null, country: null },
      }),
    ]);
  }
}
