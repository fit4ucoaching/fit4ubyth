import { ConflictError, NotFoundError } from "../../errors";
import type { GamificationRepository } from "./gamification.repository";

const CHALLENGE_COMPLETION_XP_REWARD = 50;

export class GamificationService {
  constructor(private readonly gamificationRepository: GamificationRepository) {}

  profile(userId: string) {
    return this.gamificationRepository.getOrCreateXp(userId);
  }

  badges(userId: string) {
    return this.gamificationRepository.listBadges(userId);
  }

  challenges(params: { page: number; pageSize: number }) {
    return this.gamificationRepository.listActiveChallenges(params);
  }

  async joinChallenge(userId: string, challengeId: string) {
    const challenge = await this.gamificationRepository.findChallengeById(challengeId);
    if (!challenge) {
      throw new NotFoundError("Défi introuvable.");
    }
    return this.gamificationRepository.joinChallenge(userId, challengeId);
  }

  async completeChallenge(userId: string, challengeId: string) {
    const userChallenge = await this.gamificationRepository.findUserChallenge(userId, challengeId);
    if (!userChallenge) {
      throw new NotFoundError("Vous n'avez pas rejoint ce défi.");
    }
    if (userChallenge.completedAt) {
      throw new ConflictError("Ce défi est déjà complété.");
    }

    const result = await this.gamificationRepository.completeChallenge(userId, challengeId);
    await this.gamificationRepository.addXp(userId, CHALLENGE_COMPLETION_XP_REWARD);
    return result;
  }
}
