import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/repositories/entitlement.repository");
vi.mock("../src/repositories/vipAccess.repository");

import { EntitlementRepository } from "../src/repositories/entitlement.repository";
import { VipAccessRepository } from "../src/repositories/vipAccess.repository";
import { requireFeature } from "../src/middleware/entitlement.middleware";
import { AuthorizationError } from "../src/errors";

/**
 * Tests de sécurité (Volume 7 §50, critique) — "Vérifier qu'un utilisateur
 * Free ne peut jamais obtenir Premium simplement en modifiant role/
 * subscription/isPremium/vip dans une requête frontend." Ces tests
 * simulent exactement cette attaque : un `req.user` falsifié avec des
 * valeurs "premium-like" qui ne proviennent JAMAIS d'une vérification serveur.
 */
describe("requireFeature — résistance à la falsification côté client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(EntitlementRepository.prototype.findUserEmail).mockResolvedValue("attacker@fit4u.app");
    vi.mocked(EntitlementRepository.prototype.findActiveSubscription).mockResolvedValue(null);
    vi.mocked(VipAccessRepository.prototype.findActiveByEmail).mockResolvedValue(null);
    vi.mocked(EntitlementRepository.prototype.findFeatureDefinition).mockResolvedValue({
      isActive: true, minimumLevel: "PREMIUM",
    } as never);
  });

  function buildReq(overrides: Record<string, unknown> = {}) {
    return { user: { id: "attacker1", roles: ["USER"], permissions: [], isPremium: false, ...overrides } } as never;
  }

  it("un req.user avec isPremium=true falsifié (jamais utilisé par le middleware) reste refusé", async () => {
    const req = buildReq({ isPremium: true }); // falsification du champ JWT côté attaquant hypothétique
    const next = vi.fn();

    await requireFeature("teddy.vision")(req, {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it("un rôle falsifié inventé (ex. 'PREMIUM_USER') n'est jamais reconnu comme un niveau d'accès valide", async () => {
    const req = buildReq({ roles: ["USER", "PREMIUM_USER"] });
    const next = vi.fn();

    await requireFeature("teddy.vision")(req, {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it("un utilisateur réellement ADMIN (rôle serveur légitime) passe la vérification", async () => {
    const req = buildReq({ roles: ["ADMIN"] });
    const next = vi.fn();

    await requireFeature("teddy.vision")(req, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("un utilisateur avec un VRAI abonnement PREMIUM actif (vérifié en base) passe la vérification", async () => {
    vi.mocked(EntitlementRepository.prototype.findActiveSubscription).mockResolvedValue({
      plan: { accessLevel: "PREMIUM" },
    } as never);
    const req = buildReq();
    const next = vi.fn();

    await requireFeature("teddy.vision")(req, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("aucune requête non authentifiée ne peut jamais atteindre l'EntitlementService", async () => {
    const next = vi.fn();

    await requireFeature("teddy.vision")({ user: undefined } as never, {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
