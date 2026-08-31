import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

import { env } from "../../config/env";
import { AuthenticationError, ConflictError, ValidationError } from "../../errors";
import { consumeBruteForceAttempt, resetBruteForceAttempts } from "../../middleware/rateLimit.middleware";
import { emailQueue } from "../../jobs/queue";
import { vipAccessService } from "../../services/vipAccess.service";
import { generateSecureToken, hashPassword, hashToken, verifyPassword } from "../../utils/password";
import { getPermissionsForRoles } from "../../config/permissions";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import type { AuthRepository } from "./auth.repository";
import type {
  AppleAuthInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.validators";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isPremium: boolean;
  status: string;
  locale: string;
}

/**
 * Logique métier d'authentification complète. Ne connaît jamais Express ni
 * Prisma directement (Clean Architecture — Volume 3) : dépend uniquement de
 * `AuthRepository` (injecté), ce qui la rend testable en isolation avec un
 * mock du repository (voir `tests/auth.service.spec.ts`).
 */
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ user: AuthenticatedUserDTO; tokens: AuthTokens }> {
    const existing = await this.authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("Un compte existe déjà avec cet email.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.authRepository.createUserWithProfile({
      email: input.email,
      passwordHash,
      authProvider: "EMAIL",
      firstName: input.firstName,
      lastName: input.lastName,
      locale: input.locale,
    });

    await this.sendEmailVerification(user.id, user.email);

    const { isVip } = await vipAccessService.resolveForEmail(user.email, user.id);
    const roles = await this.authRepository.getRoleNames(user.id);
    const tokens = await this.issueTokens(user.id, roles, isVip);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: input.firstName,
        lastName: input.lastName,
        roles,
        permissions: getPermissionsForRoles(roles),
        isPremium: isVip,
        status: user.status,
        locale: user.locale,
      },
      tokens,
    };
  }

  async login(
    input: LoginInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<{ user: AuthenticatedUserDTO; tokens: AuthTokens }> {
    // Protection brute force PAR EMAIL CIBLÉ — indépendante du rate limit par IP.
    await consumeBruteForceAttempt(input.email);

    const user = await this.authRepository.findUserByEmail(input.email);
    const invalidCredentialsError = new AuthenticationError("Email ou mot de passe incorrect.");

    if (!user || !user.passwordHash) {
      throw invalidCredentialsError;
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentialsError;
    }

    if (user.status === "SUSPENDED") {
      throw new AuthenticationError("Ce compte a été suspendu. Contactez le support.");
    }
    if (user.status === "DELETED") {
      throw new AuthenticationError("Ce compte n'existe plus.");
    }

    await resetBruteForceAttempts(input.email);

    const { isVip } = await vipAccessService.resolveForEmail(user.email, user.id);
    const roles = await this.authRepository.getRoleNames(user.id);
    const tokens = await this.issueTokens(user.id, roles, isVip);

    await this.authRepository.createSession({
      userId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName ?? "",
        lastName: user.profile?.lastName ?? "",
        roles,
        permissions: getPermissionsForRoles(roles),
        isPremium: isVip || (user.profile?.isPremium ?? false),
        status: user.status,
        locale: user.locale,
      },
      tokens,
    };
  }

  /** Rotation stricte : l'ancien refresh token est révoqué dès qu'un nouveau est émis. */
  async refresh(refreshTokenRaw: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenRaw);
    } catch {
      throw new AuthenticationError("Refresh token invalide ou expiré.");
    }

    const tokenHash = hashToken(refreshTokenRaw);
    const stored = await this.authRepository.findValidRefreshToken(tokenHash);
    if (!stored) {
      throw new AuthenticationError("Refresh token invalide, révoqué ou expiré.");
    }

    await this.authRepository.revokeRefreshToken(tokenHash);

    const user = await this.authRepository.findUserById(payload.sub);
    if (!user) {
      throw new AuthenticationError("Utilisateur introuvable.");
    }

    const { isVip } = await vipAccessService.resolveForEmail(user.email, user.id);
    const roles = await this.authRepository.getRoleNames(user.id);
    return this.issueTokens(user.id, roles, isVip);
  }

  async logout(refreshTokenRaw: string): Promise<void> {
    const tokenHash = hashToken(refreshTokenRaw);
    await this.authRepository.revokeRefreshToken(tokenHash);
  }

  /** Invalide TOUTES les sessions/refresh tokens — utilisé après un changement de mot de passe. */
  async logoutAllSessions(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserRefreshTokens(userId);
    await this.authRepository.revokeAllUserSessions(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email);
    // Réponse identique que l'email existe ou non : évite l'énumération de comptes.
    if (!user) return;

    const { raw, hash } = generateSecureToken();
    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });

    await emailQueue.add("password-reset", {
      to: user.email,
      template: "password-reset",
      variables: { resetUrl: `${env.WEB_APP_URL}/reset-password?token=${raw}` },
    });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);
    const stored = await this.authRepository.findValidPasswordResetToken(tokenHash);
    if (!stored) {
      throw new ValidationError("Lien de réinitialisation invalide ou expiré.");
    }

    const passwordHash = await hashPassword(input.password);
    await this.authRepository.updateUserPassword(stored.userId, passwordHash);
    await this.authRepository.markPasswordResetTokenUsed(stored.id);

    // Changement de mot de passe = révocation de toutes les sessions actives (sécurité).
    await this.logoutAllSessions(stored.userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const stored = await this.authRepository.findValidEmailVerificationToken(tokenHash);
    if (!stored) {
      throw new ValidationError("Lien de vérification invalide ou expiré.");
    }

    await this.authRepository.markEmailVerificationTokenUsed(stored.id);
    await this.authRepository.updateUserStatus(stored.userId, "ACTIVE");
  }

  async loginWithGoogle(input: GoogleAuthInput): Promise<{ user: AuthenticatedUserDTO; tokens: AuthTokens }> {
    const ticket = await googleClient.verifyIdToken({
      idToken: input.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new AuthenticationError("Jeton Google invalide.");
    }

    return this.findOrCreateOAuthUser({
      email: payload.email,
      firstName: payload.given_name ?? "Utilisateur",
      lastName: payload.family_name ?? "Fit4U",
      provider: "GOOGLE",
    });
  }

  async loginWithApple(input: AppleAuthInput): Promise<{ user: AuthenticatedUserDTO; tokens: AuthTokens }> {
    let payload;
    try {
      payload = await appleSignin.verifyIdToken(input.identityToken, {
        audience: env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
    } catch {
      throw new AuthenticationError("Jeton Apple invalide.");
    }

    if (!payload.email) {
      throw new AuthenticationError("Jeton Apple invalide : email manquant.");
    }

    // Apple ne renvoie le prénom/nom qu'à la toute première connexion (côté client) :
    // ils doivent être transmis explicitement par l'app mobile si disponibles.
    return this.findOrCreateOAuthUser({
      email: payload.email,
      firstName: input.firstName ?? "Utilisateur",
      lastName: input.lastName ?? "Fit4U",
      provider: "APPLE",
    });
  }

  async getCurrentUser(userId: string): Promise<AuthenticatedUserDTO> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AuthenticationError("Utilisateur introuvable.");
    }

    const { isVip } = await vipAccessService.resolveForEmail(user.email, user.id);
    const roles = await this.authRepository.getRoleNames(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      roles,
      permissions: getPermissionsForRoles(roles),
      isPremium: isVip || (user.profile?.isPremium ?? false),
      status: user.status,
      locale: user.locale,
    };
  }

  // ── Privé ──

  private async findOrCreateOAuthUser(params: {
    email: string;
    firstName: string;
    lastName: string;
    provider: "GOOGLE" | "APPLE";
  }): Promise<{ user: AuthenticatedUserDTO; tokens: AuthTokens }> {
    let user = await this.authRepository.findUserByEmail(params.email);

    if (!user) {
      const created = await this.authRepository.createUserWithProfile({
        email: params.email,
        passwordHash: null,
        authProvider: params.provider,
        firstName: params.firstName,
        lastName: params.lastName,
        locale: "fr",
      });
      // Un compte OAuth a l'email pré-vérifié par le provider tiers.
      await this.authRepository.updateUserStatus(created.id, "ACTIVE");
      user = await this.authRepository.findUserById(created.id);
    }

    if (!user) {
      throw new AuthenticationError("Impossible de créer ou récupérer le compte.");
    }

    const { isVip } = await vipAccessService.resolveForEmail(user.email, user.id);
    const roles = await this.authRepository.getRoleNames(user.id);
    const tokens = await this.issueTokens(user.id, roles, isVip);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName ?? params.firstName,
        lastName: user.profile?.lastName ?? params.lastName,
        roles,
        permissions: getPermissionsForRoles(roles),
        isPremium: isVip || (user.profile?.isPremium ?? false),
        status: user.status,
        locale: user.locale,
      },
      tokens,
    };
  }

  private async sendEmailVerification(userId: string, email: string): Promise<void> {
    const { raw, hash } = generateSecureToken();
    await this.authRepository.createEmailVerificationToken({
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });

    await emailQueue.add("email-verification", {
      to: email,
      template: "email-verification",
      variables: { verifyUrl: `${env.WEB_APP_URL}/verify-email?token=${raw}` },
    });
  }

  private async issueTokens(userId: string, roles: string[], isPremium: boolean): Promise<AuthTokens> {
    const permissions = getPermissionsForRoles(roles);
    const accessToken = signAccessToken({ sub: userId, roles, permissions, isPremium });

    const jti = crypto.randomUUID();
    const refreshToken = signRefreshToken({ sub: userId, jti });
    const tokenHash = hashToken(refreshToken);

    await this.authRepository.createRefreshToken({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS };
  }
}
