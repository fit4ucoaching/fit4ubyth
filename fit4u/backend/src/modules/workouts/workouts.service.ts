import { AuthorizationError, NotFoundError } from "../../errors";
import { getSocketServer } from "../../websocket";
import type { WorkoutsRepository } from "./workouts.repository";
import type { FinishWorkoutInput, StartWorkoutInput } from "./workouts.validators";

export class WorkoutsService {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  start(userId: string, input: StartWorkoutInput) {
    return this.workoutsRepository.start(userId, input);
  }

  private async assertOwnership(id: string, userId: string) {
    const session = await this.workoutsRepository.findActiveById(id, userId);
    if (!session) {
      throw new NotFoundError("Séance introuvable.");
    }
    if (session.userId !== userId) {
      throw new AuthorizationError("Cette séance ne vous appartient pas.");
    }
    return session;
  }

  async pause(userId: string, workoutSessionId: string) {
    await this.assertOwnership(workoutSessionId, userId);
    await this.workoutsRepository.logEvent(workoutSessionId, "paused");
    return this.workoutsRepository.pause(workoutSessionId);
  }

  async resume(userId: string, workoutSessionId: string) {
    await this.assertOwnership(workoutSessionId, userId);
    await this.workoutsRepository.logEvent(workoutSessionId, "resumed");
    return this.workoutsRepository.resume(workoutSessionId);
  }

  async finish(userId: string, input: FinishWorkoutInput) {
    await this.assertOwnership(input.workoutSessionId, userId);
    await this.workoutsRepository.logEvent(input.workoutSessionId, "completed", {
      exerciseCount: input.exercises.length,
    });

    const result = await this.workoutsRepository.finish(input);

    // Diffusion temps réel (canal `workout`, voir websocket/channels/workout.channel.ts).
    getSocketServer()?.to(`workout:${input.workoutSessionId}`).emit("workout:finished", {
      workoutSessionId: input.workoutSessionId,
    });

    return result;
  }

  async history(userId: string, params: { page: number; pageSize: number }) {
    const { items, total } = await this.workoutsRepository.findHistory(userId, params);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  statistics(userId: string) {
    return this.workoutsRepository.getStatistics(userId);
  }

  personalRecords(userId: string) {
    return this.workoutsRepository.getPersonalRecords(userId);
  }
}
