import { BaseRepository } from "../../repositories/base.repository";

export class ProgressRepository extends BaseRepository {
  logWeight(userId: string, input: { weightKg: number; recordedAt: Date }) {
    return this.db.weightHistory.create({ data: { userId, ...input } });
  }

  logMeasurement(userId: string, input: { bodyPart: string; valueCm: number; recordedAt: Date }) {
    return this.db.measurement.create({ data: { userId, ...input } });
  }

  logPhoto(userId: string, url: string, angle: string | undefined, recordedAt: Date) {
    return this.db.progressPhoto.create({ data: { userId, url, angle, recordedAt } });
  }

  async findHistory(userId: string, params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const [weights, measurements, photos] = await Promise.all([
      this.db.weightHistory.findMany({ where: { userId }, orderBy: { recordedAt: "desc" }, skip, take }),
      this.db.measurement.findMany({ where: { userId }, orderBy: { recordedAt: "desc" }, skip, take }),
      this.db.progressPhoto.findMany({ where: { userId, deletedAt: null }, orderBy: { recordedAt: "desc" }, skip, take }),
    ]);
    return { weights, measurements, photos };
  }

  async getAnalytics(userId: string) {
    const weights = await this.db.weightHistory.findMany({
      where: { userId },
      orderBy: { recordedAt: "asc" },
      take: 90,
    });

    const first = weights[0];
    const last = weights[weights.length - 1];
    const trendKg = first && last ? last.weightKg.toNumber() - first.weightKg.toNumber() : 0;

    const goals = await this.db.goal.findMany({ where: { userId, deletedAt: null } });
    const achievedGoals = goals.filter((g) => g.achievedAt !== null).length;

    return {
      weightTrendKg: trendKg,
      dataPoints: weights.length,
      totalGoals: goals.length,
      achievedGoals,
    };
  }
}
