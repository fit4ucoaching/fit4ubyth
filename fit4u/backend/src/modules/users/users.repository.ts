import { BaseRepository } from "../../repositories/base.repository";

export class UsersRepository extends BaseRepository {
  findFullProfile(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  updateProfile(
    userId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      bio: string;
      gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
      birthDate: Date;
      heightCm: number;
      country: string;
    }>,
  ) {
    return this.db.profile.update({ where: { userId }, data });
  }

  updateLocale(userId: string, locale: string) {
    return this.db.user.update({ where: { id: userId }, data: { locale } });
  }

  updateAvatar(userId: string, avatarUrl: string) {
    return this.db.profile.update({ where: { userId }, data: { avatarUrl } });
  }

  /** Suppression logique — jamais physique (Volume 2 : soft delete sur les tables métier). */
  async softDeleteAccount(userId: string): Promise<void> {
    const now = new Date();
    await this.db.$transaction([
      this.db.user.update({ where: { id: userId }, data: { status: "DELETED", deletedAt: now } }),
      this.db.profile.update({ where: { userId }, data: { deletedAt: now } }),
    ]);
  }

  /**
   * Agrégation cross-domaine en lecture seule pour `GET /users/statistics` —
   * lit directement plusieurs tables (workout_sessions, personal_records,
   * user_xp, posts) plutôt que de passer par chaque service de domaine, afin
   * d'exécuter une seule requête groupée performante. Exception documentée
   * et volontaire à la règle "un repository = un domaine", justifiée par la
   * nature purement agrégative (lecture seule, aucune écriture) de cet
   * endpoint de reporting.
   */
  async getStatistics(userId: string) {
    const [completedWorkouts, personalRecordsCount, xp, postsCount] = await this.db.$transaction([
      this.db.workoutSession.count({ where: { userId, status: "COMPLETED" } }),
      this.db.personalRecord.count({ where: { userId } }),
      this.db.userXp.findUnique({ where: { userId } }),
      this.db.post.count({ where: { userId, deletedAt: null } }),
    ]);

    return {
      completedWorkouts,
      personalRecordsCount,
      totalXp: xp?.totalXp ?? 0,
      currentLevel: xp?.currentLevel ?? 1,
      postsCount,
    };
  }
}
