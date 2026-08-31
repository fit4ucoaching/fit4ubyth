import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthRepository } from "../auth.repository";
import { AuthService } from "../auth.service";

vi.mock("../../../jobs/queue", () => ({
  emailQueue: { add: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../../../services/vipAccess.service", () => ({
  vipAccessService: { resolveForEmail: vi.fn().mockResolvedValue({ isVip: false }) },
}));

function buildRepositoryMock(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findUserById: vi.fn(),
    createUserWithProfile: vi.fn(),
    getRoleNames: vi.fn().mockResolvedValue(["USER"]),
    updateUserStatus: vi.fn(),
    updateUserPassword: vi.fn(),
    createRefreshToken: vi.fn().mockResolvedValue(undefined),
    findValidRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
    revokeAllUserRefreshTokens: vi.fn(),
    createSession: vi.fn().mockResolvedValue(undefined),
    revokeAllUserSessions: vi.fn(),
    createEmailVerificationToken: vi.fn().mockResolvedValue(undefined),
    findValidEmailVerificationToken: vi.fn(),
    markEmailVerificationTokenUsed: vi.fn(),
    createPasswordResetToken: vi.fn().mockResolvedValue(undefined),
    findValidPasswordResetToken: vi.fn(),
    markPasswordResetTokenUsed: vi.fn(),
    ...overrides,
  } as unknown as AuthRepository;
}

describe("AuthService.register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuse la création si l'email existe déjà", async () => {
    const repository = buildRepositoryMock({
      findUserByEmail: vi.fn().mockResolvedValue({ id: "existing-user" }),
    });
    const service = new AuthService(repository);

    await expect(
      service.register({
        email: "test@fit4u.app",
        password: "SuperSecret123",
        firstName: "Jean",
        lastName: "Dupont",
        locale: "fr",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("crée le compte, le profil et émet des tokens en cas de succès", async () => {
    const repository = buildRepositoryMock({
      createUserWithProfile: vi.fn().mockResolvedValue({
        id: "user-1",
        email: "test@fit4u.app",
        status: "PENDING",
        locale: "fr",
      }),
    });
    const service = new AuthService(repository);

    const result = await service.register({
      email: "test@fit4u.app",
      password: "SuperSecret123",
      firstName: "Jean",
      lastName: "Dupont",
      locale: "fr",
    });

    expect(result.user.email).toBe("test@fit4u.app");
    expect(result.tokens.accessToken).toBeTruthy();
    expect(repository.createRefreshToken).toHaveBeenCalledOnce();
  });
});

describe("AuthService.login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejette un compte suspendu même avec le bon mot de passe", async () => {
    const { hashPassword } = await import("../../../utils/password");
    const passwordHash = await hashPassword("SuperSecret123");

    const repository = buildRepositoryMock({
      findUserByEmail: vi.fn().mockResolvedValue({
        id: "user-1",
        email: "test@fit4u.app",
        passwordHash,
        status: "SUSPENDED",
        locale: "fr",
        profile: { firstName: "Jean", lastName: "Dupont", isPremium: false },
      }),
    });
    const service = new AuthService(repository);

    await expect(
      service.login(
        { email: "test@fit4u.app", password: "SuperSecret123" },
        { ipAddress: "127.0.0.1" },
      ),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_ERROR" });
  });
});
