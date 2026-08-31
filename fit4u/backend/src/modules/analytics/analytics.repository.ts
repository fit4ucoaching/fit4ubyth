import { redis, redisKeys } from "../../database/redis";
import { BaseRepository } from "../../repositories/base.repository";

export class AnalyticsRepository extends BaseRepository {
  /** Classement lu depuis le sorted set Redis (voir `jobs/analytics.job.ts` — recalcul périodique). */
  async getLeaderboard(kind: string, limit: number): Promise<{ userId: string; score: number }[]> {
    const key = redisKeys.leaderboard(kind);
    const raw = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");

    const result: { userId: string; score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      result.push({ userId: raw[i] as string, score: Number(raw[i + 1]) });
    }
    return result;
  }

  async enrichWithProfiles(entries: { userId: string; score: number }[]) {
    const profiles = await this.db.profile.findMany({
      where: { userId: { in: entries.map((e) => e.userId) } },
      select: { userId: true, firstName: true, lastName: true, avatarUrl: true },
    });
    const byUserId = new Map(profiles.map((p) => [p.userId, p]));

    return entries.map((entry) => ({ ...entry, profile: byUserId.get(entry.userId) }));
  }

  getEngagementOverview() {
    const since7d = new Date();
    since7d.setUTCDate(since7d.getUTCDate() - 7);

    return this.db.$transaction([
      this.db.workoutSession.count({ where: { completedAt: { gte: since7d } } }),
      this.db.post.count({ where: { createdAt: { gte: since7d }, deletedAt: null } }),
      this.db.aIMessage.count({ where: { createdAt: { gte: since7d } } }),
    ]);
  }
}
