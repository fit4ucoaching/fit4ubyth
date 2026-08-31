import { BaseRepository } from "./base.repository";

export class VipAccessRepository extends BaseRepository {
  /** Résolution par email — utilisée à chaque login/refresh (voir `VipAccessService`). */
  findActiveByEmail(email: string) {
    return this.db.vipAccess.findFirst({
      where: {
        email,
        isActive: true,
        startDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
    });
  }

  linkUserId(vipAccessId: string, userId: string) {
    return this.db.vipAccess.update({ where: { id: vipAccessId }, data: { userId } });
  }

  create(data: {
    email: string;
    userId?: string;
    isLifetime: boolean;
    startDate: Date;
    endDate?: Date;
    note?: string;
    createdBy: string;
  }) {
    return this.db.vipAccess.create({ data });
  }

  revoke(id: string) {
    return this.db.vipAccess.update({ where: { id }, data: { isActive: false } });
  }

  findMany(params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    return this.db.$transaction([
      this.db.vipAccess.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      this.db.vipAccess.count(),
    ]);
  }
}
