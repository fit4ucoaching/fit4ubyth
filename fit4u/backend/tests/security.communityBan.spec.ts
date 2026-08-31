import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/repositories/communityBan.repository");

import { CommunityBanRepository } from "../src/repositories/communityBan.repository";
import { requireNotBanned } from "../src/middleware/communityBan.middleware";
import { AuthorizationError } from "../src/errors";

/**
 * Tests de sécurité (revue continue) — vérifie que le bannissement
 * communauté a un effet RÉEL et à jour, jamais une simple donnée sans
 * conséquence. Vérifié fraîchement à chaque appel (même raisonnement que
 * `requireFeature()`, Volume 7) : un bannissement décidé par un modérateur
 * doit bloquer la publication suivante, pas après un délai.
 */
describe("requireNotBanned — application réelle du bannissement", () => {
  beforeEach(() => vi.clearAllMocks());

  function buildReq() {
    return { user: { id: "user1", roles: ["USER"], permissions: [], isPremium: false } } as never;
  }

  it("bloque la publication si un bannissement actif existe", async () => {
    vi.mocked(CommunityBanRepository.prototype.findActiveBan).mockResolvedValue({ id: "ban1", expiresAt: null } as never);
    const next = vi.fn();

    await expect(requireNotBanned(buildReq(), {} as never, next)).rejects.toThrow(AuthorizationError);
    expect(next).not.toHaveBeenCalled();
  });

  it("laisse passer un utilisateur sans bannissement actif", async () => {
    vi.mocked(CommunityBanRepository.prototype.findActiveBan).mockResolvedValue(null);
    const next = vi.fn();

    await requireNotBanned(buildReq(), {} as never, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("le message d'erreur distingue un bannissement temporaire d'un permanent", async () => {
    const expiresAt = new Date("2026-12-31");
    vi.mocked(CommunityBanRepository.prototype.findActiveBan).mockResolvedValue({ id: "ban1", expiresAt } as never);

    await expect(requireNotBanned(buildReq(), {} as never, vi.fn())).rejects.toThrow(/temporairement/);
  });

  it("rejette toute requête non authentifiée avant même de vérifier le bannissement", async () => {
    const findActiveBanSpy = vi.mocked(CommunityBanRepository.prototype.findActiveBan);

    await expect(requireNotBanned({ user: undefined } as never, {} as never, vi.fn())).rejects.toThrow();
    expect(findActiveBanSpy).not.toHaveBeenCalled();
  });
});
