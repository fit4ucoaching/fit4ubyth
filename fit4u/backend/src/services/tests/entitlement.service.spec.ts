import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../repositories/entitlement.repository");
vi.mock("../../repositories/vipAccess.repository");

import { EntitlementRepository } from "../../repositories/entitlement.repository";
import { VipAccessRepository } from "../../repositories/vipAccess.repository";
import { entitlementService } from "../entitlement.service";

/**
 * Tests de sécurité critiques (Volume 7 §50) — "Vérifier qu'un utilisateur
 * Free ne peut jamais obtenir Premium simplement en modifiant role/
 * subscription/isPremium/vip dans une requête frontend." Ici : le SEUL
 * moyen d'obtenir un niveau supérieur à FREE est un fait persisté en base
 * (rôle RBAC réel, VIP actif réel, abonnement actif réel) — jamais une
 * valeur passée en paramètre non vérifiée.
 */
describe("EntitlementService — priorité et sécurité", () => {
  beforeEach(() => {
    vi.mocked(EntitlementRepository.prototype.findUserEmail).mockResolvedValue("user@fit4u.app");
    vi.mocked(EntitlementRepository.prototype.findActiveSubscription).mockResolvedValue(null);
    vi.mocked(VipAccessRepository.prototype.findActiveByEmail).mockResolvedValue(null);
  });

  it("ADMIN prime sur tout le reste (rôle RBAC réel)", async () => {
    const { level, source } = await entitlementService.resolveAccessLevel({ userId: "u1", roles: ["ADMIN"] });
    expect(level).toBe("ADMIN");
    expect(source).toBe("role");
  });

  it("VIP prime sur PREMIUM même si un abonnement Premium existe en parallèle", async () => {
    vi.mocked(VipAccessRepository.prototype.findActiveByEmail).mockResolvedValue({ id: "vip1" } as never);
    vi.mocked(EntitlementRepository.prototype.findActiveSubscription).mockResolvedValue({
      plan: { accessLevel: "PREMIUM" },
    } as never);

    const { level, source } = await entitlementService.resolveAccessLevel({ userId: "u1", roles: [] });
    expect(level).toBe("VIP");
    expect(source).toBe("vip");
  });

  it("un abonnement actif donne le niveau du plan souscrit", async () => {
    vi.mocked(EntitlementRepository.prototype.findActiveSubscription).mockResolvedValue({
      plan: { accessLevel: "PRO" },
    } as never);

    const { level, source } = await entitlementService.resolveAccessLevel({ userId: "u1", roles: [] });
    expect(level).toBe("PRO");
    expect(source).toBe("subscription");
  });

  it("sans rôle/VIP/abonnement, retombe sur FREE — jamais un niveau supérieur par défaut", async () => {
    const { level, source } = await entitlementService.resolveAccessLevel({ userId: "u1", roles: ["USER"] });
    expect(level).toBe("FREE");
    expect(source).toBe("default");
  });

  it("hasFeature refuse (fail-closed) une fonctionnalité inconnue", async () => {
    vi.mocked(EntitlementRepository.prototype.findFeatureDefinition).mockResolvedValue(null);
    const granted = await entitlementService.hasFeature({ userId: "u1", roles: ["ADMIN"] }, "feature.inexistante");
    expect(granted).toBe(false);
  });

  it("hasFeature refuse une fonctionnalité désactivée même pour un ADMIN", async () => {
    vi.mocked(EntitlementRepository.prototype.findFeatureDefinition).mockResolvedValue({
      isActive: false, minimumLevel: "FREE",
    } as never);
    const granted = await entitlementService.hasFeature({ userId: "u1", roles: ["ADMIN"] }, "feature.desactivee");
    expect(granted).toBe(false);
  });

  it("un rôle USER simple (non-admin) ne peut jamais atteindre ADMIN par usurpation de rôle string arbitraire", async () => {
    const { level } = await entitlementService.resolveAccessLevel({ userId: "u1", roles: ["USER", "PREMIUM_USER_FAKE"] });
    expect(level).toBe("FREE"); // un nom de rôle inventé n'est jamais reconnu comme ADMIN/VIP/PRO
  });
});
