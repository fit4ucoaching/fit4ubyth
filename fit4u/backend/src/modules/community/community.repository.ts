import { BaseRepository } from "../../repositories/base.repository";

export class CommunityRepository extends BaseRepository {
  async findPosts(params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { deletedAt: null, visibility: "PUBLIC" as const };
    const [items, total] = await this.db.$transaction([
      this.db.post.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { comments: true, likes: true } } },
      }),
      this.db.post.count({ where }),
    ]);
    return { items, total };
  }

  findPostById(id: string) {
    return this.db.post.findFirst({ where: { id, deletedAt: null } });
  }

  createPost(userId: string, data: { content: string; imageUrl?: string; visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" }) {
    return this.db.post.create({ data: { userId, ...data } });
  }

  updatePost(id: string, data: Partial<{ content: string; imageUrl: string; visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" }>) {
    return this.db.post.update({ where: { id }, data });
  }

  softDeletePost(id: string) {
    return this.db.post.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  createComment(userId: string, postId: string, content: string) {
    return this.db.comment.create({ data: { userId, postId, content } });
  }

  async toggleLike(userId: string, postId: string): Promise<{ liked: boolean }> {
    const existing = await this.db.like.findUnique({ where: { postId_userId: { postId, userId } } });
    if (existing) {
      await this.db.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.db.like.create({ data: { userId, postId } });
    return { liked: true };
  }

  async findGroups(params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { deletedAt: null, isPrivate: false };
    const [items, total] = await this.db.$transaction([
      this.db.group.findMany({ where, skip, take, include: { _count: { select: { members: true } } } }),
      this.db.group.count({ where }),
    ]);
    return { items, total };
  }

  async createGroup(userId: string, data: { name: string; slug: string; description?: string; isPrivate: boolean }) {
    return this.db.group.create({
      data: { ...data, members: { create: { userId, role: "OWNER" } } },
    });
  }
}
