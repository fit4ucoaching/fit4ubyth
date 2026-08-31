import { BaseRepository } from "../../repositories/base.repository";

const XP_PER_LEVEL_BASE = 500;

export class GamificationRepository extends BaseRepository {
  async getOrCreateXp(userId: string) {
    const existing = await this.db.userXp.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.db.userXp.create({ data: { userId } });
  }

  async addXp(userId: string, amount: number) {
    const current = await this.getOrCreateXp(userId);
    const totalXp = current.totalXp + amount;
    const currentLevel = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL_BASE) + 1);

    return this.db.userXp.update({ where: { userId }, data: { totalXp, currentLevel } });
  }

  listBadges(userId: string) {
    return this.db.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { unlockedAt: "desc" } });
  }

  async unlockBadge(userId: string, badgeId: string) {
    const existing = await this.db.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId } } });
    if (existing) return existing;
    return this.db.userBadge.create({ data: { userId, badgeId } });
  }

  listActiveChallenges(params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    return this.db.challenge.findMany({
      where: { deletedAt: null, status: { in: ["UPCOMING", "ACTIVE"] } },
      skip,
      take,
      orderBy: { startDate: "asc" },
    });
  }

  findChallengeById(id: string) {
    return this.db.challenge.findFirst({ where: { id, deletedAt: null } });
  }

  async joinChallenge(userId: string, challengeId: string) {
    return this.db.userChallenge.upsert({
      where: { userId_challengeId: { userId, challengeId } },
      create: { userId, challengeId },
      update: {},
    });
  }

  async completeChallenge(userId: string, challengeId: string) {
    return this.db.userChallenge.update({
      where: { userId_challengeId: { userId, challengeId } },
      data: { progress: 100, completedAt: new Date() },
    });
  }

  findUserChallenge(userId: string, challengeId: string) {
    return this.db.userChallenge.findUnique({ where: { userId_challengeId: { userId, challengeId } } });
  }
}
