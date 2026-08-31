import { BaseRepository } from "./base.repository";

export class CommunityBanRepository extends BaseRepository {
  /** Bannissement actif — permanent (`expiresAt` null) ou dans sa fenêtre, jamais levé. */
  findActiveBan(userId: string) {
    return this.db.communityBan.findFirst({
      where: {
        userId,
        liftedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: { userId: string; reason: string; bannedBy: string; expiresAt?: Date }) {
    return this.db.communityBan.create({ data });
  }

  lift(id: string) {
    return this.db.communityBan.update({ where: { id }, data: { liftedAt: new Date() } });
  }

  async listBans(params: { page: number; pageSize: number; activeOnly?: boolean }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = params.activeOnly
      ? { liftedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.communityBan.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { user: { include: { profile: true } }, banner: true } }),
      this.db.communityBan.count({ where }),
    ]);
    return { items, total };
  }
}
