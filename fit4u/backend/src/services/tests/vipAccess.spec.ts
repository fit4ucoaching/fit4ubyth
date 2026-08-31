import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../repositories/vipAccess.repository");

import { VipAccessRepository } from "../../repositories/vipAccess.repository";
import { vipAccessService } from "../vipAccess.service";

/**
 * Tests VIP (Volume 7 §49) — lifetime, temporaire, expiration, révocation,
 * reconnexion. La logique d'expiration elle-même est déléguée à la requête
 * Prisma (`findActiveByEmail` filtre `endDate` côté base) — ces tests
 * vérifient le contrat du service, pas une ré-implémentation parallèle.
 */
describe("VipAccessService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("VIP à vie : isLifetime=true, endDate absente, transmis tel quel au repository", async () => {
    const createSpy = vi.mocked(VipAccessRepository.prototype.create).mockResolvedValue({ id: "vip1" } as never);
    const startDate = new Date();

    await vipAccessService.grant({ email: "lifetime@fit4u.app", isLifetime: true, startDate, createdBy: "admin1" });

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ isLifetime: true, endDate: undefined }));
  });

  it("VIP temporaire : endDate fournie et transmise telle quelle", async () => {
    const endDate = new Date("2026-12-31");
    const startDate = new Date();
    const createSpy = vi.mocked(VipAccessRepository.prototype.create).mockResolvedValue({ id: "vip2" } as never);

    await vipAccessService.grant({ email: "temp@fit4u.app", isLifetime: false, startDate, endDate, createdBy: "admin1" });

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ isLifetime: false, endDate }));
  });

  it("expiration : resolveForEmail ne réévalue jamais endDate lui-même — c'est le repository (requête Prisma) qui fait foi", async () => {
    const findSpy = vi.mocked(VipAccessRepository.prototype.findActiveByEmail).mockResolvedValue(null);

    const result = await vipAccessService.resolveForEmail("expired@fit4u.app", "user1");

    expect(findSpy).toHaveBeenCalledWith("expired@fit4u.app");
    expect(result).toEqual({ isVip: false }); // le repository a déjà exclu l'entrée expirée
  });

  it("révocation : passe par revoke() (isActive=false) — jamais une suppression", async () => {
    const revokeSpy = vi.mocked(VipAccessRepository.prototype.revoke).mockResolvedValue({ id: "vip3", isActive: false } as never);

    const result = await vipAccessService.revoke("vip3");

    expect(revokeSpy).toHaveBeenCalledWith("vip3");
    expect(result).toEqual({ id: "vip3", isActive: false });
  });

  it("reconnexion : resolveForEmail lie automatiquement le compte VIP au userId à la première connexion détectée", async () => {
    vi.mocked(VipAccessRepository.prototype.findActiveByEmail).mockResolvedValue({ id: "vip4", userId: null } as never);
    const linkSpy = vi.mocked(VipAccessRepository.prototype.linkUserId).mockResolvedValue({} as never);

    const result = await vipAccessService.resolveForEmail("user@fit4u.app", "user1");

    expect(linkSpy).toHaveBeenCalledWith("vip4", "user1");
    expect(result).toEqual({ isVip: true, vipAccessId: "vip4" });
  });

  it("reconnexion ultérieure : un accès déjà lié n'est jamais re-lié inutilement", async () => {
    vi.mocked(VipAccessRepository.prototype.findActiveByEmail).mockResolvedValue({ id: "vip5", userId: "user1" } as never);
    const linkSpy = vi.mocked(VipAccessRepository.prototype.linkUserId);

    await vipAccessService.resolveForEmail("user@fit4u.app", "user1");

    expect(linkSpy).not.toHaveBeenCalled();
  });
});
