import type { Prisma } from "@prisma/client";

import { BaseRepository } from "../../repositories/base.repository";
import type { CreateExerciseInput, ListExercisesQuery, UpdateExerciseInput } from "./exercises.validators";

export class ExercisesRepository extends BaseRepository {
  async findMany(query: ListExercisesQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where: Prisma.ExerciseWhereInput = {
      deletedAt: null,
      categoryId: query.categoryId,
      difficultyLevel: query.difficultyLevel,
      primaryMuscleId: query.muscleGroupId,
      ...(query.equipmentId
        ? { equipmentLinks: { some: { equipmentId: query.equipmentId } } }
        : {}),
    };

    const [items, total] = await this.db.$transaction([
      this.db.exercise.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
        include: { category: true, primaryMuscle: true },
      }),
      this.db.exercise.count({ where }),
    ]);

    return { items, total };
  }

  async search(term: string, params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where: Prisma.ExerciseWhereInput = {
      deletedAt: null,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ],
    };

    const [items, total] = await this.db.$transaction([
      this.db.exercise.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      this.db.exercise.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.db.exercise.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        primaryMuscle: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
        tips: { orderBy: { sortOrder: "asc" } },
        mistakes: { orderBy: { sortOrder: "asc" } },
        restrictions: true,
        muscleGroupLinks: { include: { muscleGroup: true } },
        equipmentLinks: { include: { equipment: true } },
      },
    });
  }

  create(input: CreateExerciseInput) {
    const { secondaryMuscleGroupIds, equipmentIds, ...data } = input;
    return this.db.exercise.create({
      data: {
        ...data,
        muscleGroupLinks: {
          create: secondaryMuscleGroupIds.map((muscleGroupId) => ({ muscleGroupId })),
        },
        equipmentLinks: { create: equipmentIds.map((equipmentId) => ({ equipmentId })) },
      },
    });
  }

  async update(id: string, input: UpdateExerciseInput) {
    const { secondaryMuscleGroupIds, equipmentIds, ...data } = input;

    return this.db.$transaction(async (tx) => {
      if (secondaryMuscleGroupIds) {
        await tx.exerciseMuscleGroup.deleteMany({ where: { exerciseId: id } });
        await tx.exerciseMuscleGroup.createMany({
          data: secondaryMuscleGroupIds.map((muscleGroupId) => ({ exerciseId: id, muscleGroupId })),
        });
      }
      if (equipmentIds) {
        await tx.exerciseEquipment.deleteMany({ where: { exerciseId: id } });
        await tx.exerciseEquipment.createMany({
          data: equipmentIds.map((equipmentId) => ({ exerciseId: id, equipmentId })),
        });
      }
      return tx.exercise.update({ where: { id }, data });
    });
  }

  softDelete(id: string) {
    return this.db.exercise.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async toggleFavorite(userId: string, exerciseId: string): Promise<{ isFavorite: boolean }> {
    const existing = await this.db.favoriteExercise.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });

    if (existing) {
      await this.db.favoriteExercise.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    }

    await this.db.favoriteExercise.create({ data: { userId, exerciseId } });
    return { isFavorite: true };
  }

  listFavorites(userId: string) {
    return this.db.favoriteExercise.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
