import { BaseRepository } from "../../repositories/base.repository";

const DEFAULT_ROLE_NAME = "USER";

export class AuthRepository extends BaseRepository {
  findUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
      include: { profile: true, userRoles: { include: { role: true } } },
    });
  }

  findUserById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: { profile: true, userRoles: { include: { role: true } } },
    });
  }

  /**
   * Crée l'utilisateur, son profil et son rôle par défaut dans une seule
   * transaction ACID — soit tout réussit, soit rien n'est persisté
   * (Volume 2 : "Transactions ACID").
   */
  async createUserWithProfile(data: {
    email: string;
    passwordHash: string | null;
    authProvider: "EMAIL" | "GOOGLE" | "APPLE";
    firstName: string;
    lastName: string;
    locale: string;
  }) {
    return this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          authProvider: data.authProvider,
          locale: data.locale,
          status: "PENDING",
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      let defaultRole = await tx.role.findUnique({ where: { name: DEFAULT_ROLE_NAME } });
      defaultRole ??= await tx.role.create({
        data: { name: DEFAULT_ROLE_NAME, description: "Utilisateur standard", permissions: [] },
      });

      await tx.userRole.create({ data: { userId: user.id, roleId: defaultRole.id } });

      return user;
    });
  }

  async getRoleNames(userId: string): Promise<string[]> {
    const userRoles = await this.db.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  }

  updateUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING" | "DELETED") {
    return this.db.user.update({ where: { id: userId }, data: { status } });
  }

  updateUserPassword(userId: string, passwordHash: string) {
    return this.db.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  // ── Refresh tokens (rotation) ──

  async createRefreshToken(params: { userId: string; tokenHash: string; expiresAt: Date }) {
    return this.db.refreshToken.create({
      data: { userId: params.userId, tokenHash: params.tokenHash, expiresAt: params.expiresAt },
    });
  }

  findValidRefreshToken(tokenHash: string) {
    return this.db.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  revokeRefreshToken(tokenHash: string) {
    return this.db.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllUserRefreshTokens(userId: string) {
    return this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── Sessions / appareils ──

  async upsertDevice(params: {
    userId: string;
    os: "IOS" | "ANDROID" | "WEB";
    pushToken?: string;
    model?: string;
    appVersion?: string;
  }) {
    const existing = await this.db.device.findFirst({
      where: { userId: params.userId, pushToken: params.pushToken ?? undefined },
    });
    if (existing) {
      return this.db.device.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), appVersion: params.appVersion },
      });
    }
    return this.db.device.create({
      data: {
        userId: params.userId,
        os: params.os,
        pushToken: params.pushToken,
        model: params.model,
        appVersion: params.appVersion,
      },
    });
  }

  createSession(params: {
    userId: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return this.db.session.create({
      data: {
        userId: params.userId,
        deviceId: params.deviceId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt: params.expiresAt,
      },
    });
  }

  revokeAllUserSessions(userId: string) {
    return this.db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── Vérification email ──

  createEmailVerificationToken(params: { userId: string; tokenHash: string; expiresAt: Date }) {
    return this.db.emailVerificationToken.create({
      data: { userId: params.userId, tokenHash: params.tokenHash, expiresAt: params.expiresAt },
    });
  }

  findValidEmailVerificationToken(tokenHash: string) {
    return this.db.emailVerificationToken.findFirst({
      where: { tokenHash, verifiedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  markEmailVerificationTokenUsed(id: string) {
    return this.db.emailVerificationToken.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });
  }

  // ── Réinitialisation de mot de passe ──

  createPasswordResetToken(params: { userId: string; tokenHash: string; expiresAt: Date }) {
    return this.db.passwordResetToken.create({
      data: { userId: params.userId, tokenHash: params.tokenHash, expiresAt: params.expiresAt },
    });
  }

  findValidPasswordResetToken(tokenHash: string) {
    return this.db.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  markPasswordResetTokenUsed(id: string) {
    return this.db.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}
