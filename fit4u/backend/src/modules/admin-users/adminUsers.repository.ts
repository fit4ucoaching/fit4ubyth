import type { Prisma } from "@prisma/client";

import { BaseRepository } from "../../repositories/base.repository";
import type { ListUsersQuery } from "./adminUsers.validators";

export class AdminUsersRepository extends BaseRepository {
  async findMany(query: ListUsersQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where: Prisma.UserWhereInput = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { email: { contains: query.q, mode: "insensitive" } },
              { profile: { firstName: { contains: query.q, mode: "insensitive" } } },
              { profile: { lastName: { contains: query.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.db.$transaction([
      this.db.user.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy]: query.sortDirection },
        include: { profile: true, userRoles: { include: { role: true } } },
      }),
      this.db.user.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Fiche utilisateur complète (Volume 6) — profil, objectifs, poids,
   * séances, nutrition, badges, commandes, paiements, conversations Teddy,
   * logs. Une seule requête groupée plutôt que N appels séquentiels.
   */
  async findFullProfile(userId: string) {
    const [user, goals, weightHistory, workoutSessions, mealPlans, badges, orders, payments, conversations, adminLogsAbout] =
      await this.db.$transaction([
        this.db.user.findUnique({ where: { id: userId }, include: { profile: true, userRoles: { include: { role: true } } } }),
        this.db.goal.findMany({ where: { userId, deletedAt: null } }),
        this.db.weightHistory.findMany({ where: { userId }, orderBy: { recordedAt: "desc" }, take: 20 }),
        this.db.workoutSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
        this.db.mealPlan.findMany({ where: { userId, deletedAt: null }, take: 10 }),
        this.db.userBadge.findMany({ where: { userId }, include: { badge: true } }),
        this.db.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
        this.db.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
        this.db.aIConversation.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
        this.db.adminLog.findMany({ where: { targetType: "User", targetId: userId }, orderBy: { createdAt: "desc" }, take: 20 }),
      ]);

    return { user, goals, weightHistory, workoutSessions, mealPlans, badges, orders, payments, conversations, adminLogs: adminLogsAbout };
  }

  updateStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING" | "DELETED") {
    return this.db.user.update({ where: { id: userId }, data: { status } });
  }

  async assignRole(userId: string, roleName: string) {
    let role = await this.db.role.findUnique({ where: { name: roleName } });
    role ??= await this.db.role.create({ data: { name: roleName, description: `Rôle ${roleName}`, permissions: [] } });

    await this.db.userRole.deleteMany({ where: { userId } });
    return this.db.userRole.create({ data: { userId, roleId: role.id } });
  }

  updatePremium(userId: string, isPremium: boolean) {
    return this.db.profile.update({ where: { userId }, data: { isPremium } });
  }

  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.db.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  }
}
