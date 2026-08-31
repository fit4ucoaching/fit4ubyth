import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../services/auditLog.service", () => ({ auditLogService: { record: vi.fn() } }));
vi.mock("../../../repositories/communityBan.repository");

import { CommunityBanRepository } from "../../../repositories/communityBan.repository";
import { AdminCommunityService } from "../adminCommunity.service";
import type { AdminCommunityRepository } from "../adminCommunity.repository";

/** Tests admin-community — vérifie que "ACTIONED" retire réellement le contenu, jamais un simple changement de statut. */
function buildRepositoryMock(overrides: Partial<AdminCommunityRepository> = {}): AdminCommunityRepository {
  return {
    findReportById: vi.fn().mockResolvedValue({ id: "report1", targetType: "POST", targetId: "post1", status: "PENDING" }),
    reviewReport: vi.fn().mockResolvedValue({ id: "report1", status: "ACTIONED" }),
    softDeletePost: vi.fn().mockResolvedValue({}),
    softDeleteComment: vi.fn().mockResolvedValue({}),
    listReports: vi.fn(),
    resolveReportedContent: vi.fn(),
    ...overrides,
  } as unknown as AdminCommunityRepository;
}

describe("AdminCommunityService.reviewReport", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ACTIONED sur un signalement de POST retire réellement le post (soft delete), pas seulement le statut", async () => {
    const repository = buildRepositoryMock();
    const service = new AdminCommunityService(repository);

    await service.reviewReport("admin1", "report1", { status: "ACTIONED" });

    expect(repository.softDeletePost).toHaveBeenCalledWith("post1");
    expect(repository.softDeleteComment).not.toHaveBeenCalled();
  });

  it("ACTIONED sur un signalement de COMMENT retire le commentaire, pas le post", async () => {
    const repository = buildRepositoryMock({
      findReportById: vi.fn().mockResolvedValue({ id: "report2", targetType: "COMMENT", targetId: "comment1", status: "PENDING" }),
    } as never);
    const service = new AdminCommunityService(repository);

    await service.reviewReport("admin1", "report2", { status: "ACTIONED" });

    expect(repository.softDeleteComment).toHaveBeenCalledWith("comment1");
    expect(repository.softDeletePost).not.toHaveBeenCalled();
  });

  it("DISMISSED ne retire aucun contenu", async () => {
    const repository = buildRepositoryMock();
    const service = new AdminCommunityService(repository);

    await service.reviewReport("admin1", "report1", { status: "DISMISSED" });

    expect(repository.softDeletePost).not.toHaveBeenCalled();
    expect(repository.softDeleteComment).not.toHaveBeenCalled();
  });

  it("refuse de traiter un signalement introuvable", async () => {
    const repository = buildRepositoryMock({ findReportById: vi.fn().mockResolvedValue(null) } as never);
    const service = new AdminCommunityService(repository);

    await expect(service.reviewReport("admin1", "inexistant", { status: "DISMISSED" })).rejects.toThrow("introuvable");
  });
});

describe("AdminCommunityService.banUser", () => {
  it("un bannissement sans expiresAt est permanent", async () => {
    vi.mocked(CommunityBanRepository.prototype.create).mockResolvedValue({ id: "ban1" } as never);
    const service = new AdminCommunityService(buildRepositoryMock());

    await service.banUser("admin1", { userId: "user1", reason: "Contenu inapproprié répété" });

    expect(CommunityBanRepository.prototype.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user1", expiresAt: undefined }),
    );
  });
});
