import { env } from "../../config/env";
import { NotFoundError } from "../../errors";
import { emailQueue } from "../../jobs/queue";
import { auditLogService } from "../../services/auditLog.service";
import { generateSecureToken } from "../../utils/password";
import type { AdminUsersRepository } from "./adminUsers.repository";
import type { ChangeRoleInput, GrantPremiumInput, ListUsersQuery } from "./adminUsers.validators";

export interface AdminActionContext {
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service de gestion des utilisateurs BackOffice (Volume 6). Chaque action
 * d'écriture journalise systématiquement avant/après via `auditLogService`
 * — jamais une modification silencieuse d'un compte utilisateur depuis
 * l'admin.
 */
export class AdminUsersService {
  constructor(private readonly repository: AdminUsersRepository) {}

  list(query: ListUsersQuery) {
    return this.repository.findMany(query);
  }

  async getFullProfile(userId: string) {
    const data = await this.repository.findFullProfile(userId);
    if (!data.user) {
      throw new NotFoundError("Utilisateur introuvable.");
    }
    return data;
  }

  async suspend(userId: string, context: AdminActionContext) {
    const before = await this.getFullProfile(userId);
    const updated = await this.repository.updateStatus(userId, "SUSPENDED");
    await auditLogService.record({
      performedBy: context.adminId,
      action: "USER_SUSPENDED",
      targetType: "User",
      targetId: userId,
      before: { status: before.user!.status },
      after: { status: "SUSPENDED" },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return updated;
  }

  async reactivate(userId: string, context: AdminActionContext) {
    const before = await this.getFullProfile(userId);
    const updated = await this.repository.updateStatus(userId, "ACTIVE");
    await auditLogService.record({
      performedBy: context.adminId,
      action: "USER_REACTIVATED",
      targetType: "User",
      targetId: userId,
      before: { status: before.user!.status },
      after: { status: "ACTIVE" },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return updated;
  }

  async softDelete(userId: string, context: AdminActionContext) {
    await this.getFullProfile(userId); // 404 si absent
    const updated = await this.repository.updateStatus(userId, "DELETED");
    await auditLogService.record({
      performedBy: context.adminId,
      action: "USER_DELETED",
      targetType: "User",
      targetId: userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return updated;
  }

  async changeRole(userId: string, input: ChangeRoleInput, context: AdminActionContext) {
    const before = await this.getFullProfile(userId);
    const beforeRoles = before.user!.userRoles.map((ur) => ur.role.name);
    const updated = await this.repository.assignRole(userId, input.roleName);
    await auditLogService.record({
      performedBy: context.adminId,
      action: "USER_ROLE_CHANGED",
      targetType: "User",
      targetId: userId,
      before: { roles: beforeRoles },
      after: { roles: [input.roleName] },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return updated;
  }

  async grantPremium(userId: string, input: GrantPremiumInput, context: AdminActionContext) {
    await this.getFullProfile(userId);
    const updated = await this.repository.updatePremium(userId, input.isPremium);
    await auditLogService.record({
      performedBy: context.adminId,
      action: input.isPremium ? "USER_PREMIUM_GRANTED" : "USER_PREMIUM_REVOKED",
      targetType: "User",
      targetId: userId,
      after: { isPremium: input.isPremium },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return updated;
  }

  /** Déclenche un email de réinitialisation pour le compte, comme si l'utilisateur l'avait demandé lui-même. */
  async resetPassword(userId: string, context: AdminActionContext) {
    const profileData = await this.getFullProfile(userId);
    const { raw, hash } = generateSecureToken();
    await this.repository.createPasswordResetToken(userId, hash, new Date(Date.now() + 60 * 60 * 1000));

    await emailQueue.add("password-reset", {
      to: profileData.user!.email,
      template: "password-reset",
      variables: { resetUrl: `${env.WEB_APP_URL}/reset-password?token=${raw}` },
    });

    await auditLogService.record({
      performedBy: context.adminId,
      action: "USER_PASSWORD_RESET_TRIGGERED",
      targetType: "User",
      targetId: userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { message: "Email de réinitialisation envoyé." };
  }
}
