import { BaseRepository } from "../../repositories/base.repository";

export class WorkoutsRepository extends BaseRepository {
  async start(userId: string, input: { programId?: string; title: string; exerciseIds: string[] }) {
    return this.db.workoutSession.create({
      data: {
        userId,
        programId: input.programId,
        title: input.title,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        exercises: {
          create: input.exerciseIds.map((exerciseId, index) => ({ exerciseId, sortOrder: index })),
        },
      },
      include: { exercises: { include: { exercise: true } } },
    });
  }

  findActiveById(id: string, userId: string) {
    return this.db.workoutSession.findFirst({
      where: { id, userId, deletedAt: null },
      include: { exercises: true },
    });
  }

  logEvent(workoutSessionId: string, event: string, metadata?: Record<string, unknown>) {
    return this.db.workoutHistory.create({ data: { workoutSessionId, event, metadata } });
  }

  pause(id: string) {
    return this.db.workoutSession.update({ where: { id }, data: { status: "PLANNED" } });
  }

  resume(id: string) {
    return this.db.workoutSession.update({ where: { id }, data: { status: "IN_PROGRESS" } });
  }

  async finish(params: {
    workoutSessionId: string;
    caloriesBurned?: number;
    exercises: {
      exerciseId: string;
      setsCompleted: number;
      repsCompleted?: number;
      weightUsedKg?: number;
      durationSeconds?: number;
    }[];
  }) {
    const session = await this.db.workoutSession.findUniqueOrThrow({ where: { id: params.workoutSessionId } });

    return this.db.$transaction(async (tx) => {
      for (const ex of params.exercises) {
        await tx.workoutExercise.updateMany({
          where: { workoutSessionId: params.workoutSessionId, exerciseId: ex.exerciseId },
          data: {
            setsCompleted: ex.setsCompleted,
            repsCompleted: ex.repsCompleted,
            weightUsedKg: ex.weightUsedKg,
            durationSeconds: ex.durationSeconds,
            isCompleted: true,
          },
        });
      }

      const durationSeconds = session.startedAt
        ? Math.round((Date.now() - session.startedAt.getTime()) / 1000)
        : undefined;

      return tx.workoutSession.update({
        where: { id: params.workoutSessionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          durationSeconds,
          caloriesBurned: params.caloriesBurned,
        },
        include: { exercises: { include: { exercise: true } } },
      });
    });
  }

  async findHistory(userId: string, params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { userId, status: "COMPLETED" as const, deletedAt: null };

    const [items, total] = await this.db.$transaction([
      this.db.workoutSession.findMany({ where, skip, take, orderBy: { completedAt: "desc" } }),
      this.db.workoutSession.count({ where }),
    ]);
    return { items, total };
  }

  async getStatistics(userId: string) {
    const [totalCompleted, totalDuration, totalCalories] = await Promise.all([
      this.db.workoutSession.count({ where: { userId, status: "COMPLETED" } }),
      this.db.workoutSession.aggregate({ where: { userId, status: "COMPLETED" }, _sum: { durationSeconds: true } }),
      this.db.workoutSession.aggregate({ where: { userId, status: "COMPLETED" }, _sum: { caloriesBurned: true } }),
    ]);
    return {
      totalCompleted,
      totalDurationSeconds: totalDuration._sum.durationSeconds ?? 0,
      totalCaloriesBurned: totalCalories._sum.caloriesBurned?.toNumber() ?? 0,
    };
  }

  getPersonalRecords(userId: string) {
    return this.db.personalRecord.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { achievedAt: "desc" },
    });
  }
}
