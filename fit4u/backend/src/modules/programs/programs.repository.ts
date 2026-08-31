import type { Prisma } from "@prisma/client";

import { BaseRepository } from "../../repositories/base.repository";
import type { CreateProgramInput, ListProgramsQuery, UpdateProgramInput } from "./programs.validators";

export class ProgramsRepository extends BaseRepository {
  async findMany(query: ListProgramsQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where: Prisma.ProgramWhereInput = {
      deletedAt: null,
      isPublished: true,
      categoryId: query.categoryId,
      goalType: query.goalType,
      difficultyLevel: query.difficultyLevel,
    };

    const [items, total] = await this.db.$transaction([
      this.db.program.findMany({ where, skip, take, include: { category: true }, orderBy: { createdAt: "desc" } }),
      this.db.program.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: string) {
    return this.db.program.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        weeks: {
          orderBy: { weekNumber: "asc" },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: {
                exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } },
                warmups: true,
                cooldowns: true,
                stretchingPrograms: true,
              },
            },
          },
        },
      },
    });
  }

  create(input: CreateProgramInput) {
    return this.db.program.create({ data: { ...input, isPublished: false } });
  }

  update(id: string, input: UpdateProgramInput) {
    return this.db.program.update({ where: { id }, data: input });
  }

  softDelete(id: string) {
    return this.db.program.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
