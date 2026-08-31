import { BaseRepository } from "./base.repository";

export interface CreateAuditLogInput {
  performedBy: string;
  action: string;
  targetType?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogRepository extends BaseRepository {
  create(input: CreateAuditLogInput) {
    return this.db.adminLog.create({
      data: {
        performedBy: input.performedBy,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: {
          before: (input.before ?? null) as object | null,
          after: (input.after ?? null) as object | null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      },
    });
  }

  async findMany(params: {
    page: number;
    pageSize: number;
    action?: string;
    targetType?: string;
    performedBy?: string;
  }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = {
      action: params.action ? { contains: params.action, mode: "insensitive" as const } : undefined,
      targetType: params.targetType,
      performedBy: params.performedBy,
    };

    const [items, total] = await this.db.$transaction([
      this.db.adminLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { admin: { include: { profile: true } } },
      }),
      this.db.adminLog.count({ where }),
    ]);

    return { items, total };
  }
}
