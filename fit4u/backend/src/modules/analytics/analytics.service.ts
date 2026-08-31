import type { AnalyticsRepository } from "./analytics.repository";

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async leaderboard(kind: string, limit: number) {
    const entries = await this.analyticsRepository.getLeaderboard(kind, limit);
    return this.analyticsRepository.enrichWithProfiles(entries);
  }

  async overview() {
    const [workoutsCompleted7d, posts7d, teddyMessages7d] = await this.analyticsRepository.getEngagementOverview();
    return { workoutsCompleted7d, posts7d, teddyMessages7d };
  }
}
