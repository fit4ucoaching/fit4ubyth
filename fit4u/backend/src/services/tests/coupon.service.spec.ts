import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../repositories/coupon.repository");

import { CouponRepository } from "../../repositories/coupon.repository";
import { couponService } from "../coupon.service";

/** Tests coupons (Volume 7 §23) — validation, expiration, limite d'utilisations, calcul de réduction. */
describe("couponService.validate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejette un code inconnu ou inactif", async () => {
    vi.mocked(CouponRepository.prototype.findActiveByCode).mockResolvedValue(null);
    await expect(couponService.validate("INEXISTANT", 10000)).rejects.toThrow("Coupon invalide ou inactif.");
  });

  it("rejette un coupon expiré", async () => {
    vi.mocked(CouponRepository.prototype.findActiveByCode).mockResolvedValue({
      id: "c1", type: "PERCENTAGE", value: { toNumber: () => 10 }, expiresAt: new Date("2020-01-01"),
      maxRedemptions: null, redeemedCount: 0,
    } as never);
    await expect(couponService.validate("EXPIRED2020", 10000)).rejects.toThrow("expiré");
  });

  it("rejette un coupon ayant atteint sa limite d'utilisations", async () => {
    vi.mocked(CouponRepository.prototype.findActiveByCode).mockResolvedValue({
      id: "c2", type: "FIXED_AMOUNT", value: { toNumber: () => 5 }, expiresAt: null,
      maxRedemptions: 100, redeemedCount: 100,
    } as never);
    await expect(couponService.validate("MAXED", 10000)).rejects.toThrow("nombre maximal");
  });

  it("calcule correctement une réduction en pourcentage", async () => {
    vi.mocked(CouponRepository.prototype.findActiveByCode).mockResolvedValue({
      id: "c3", type: "PERCENTAGE", value: { toNumber: () => 20 }, expiresAt: null,
      maxRedemptions: null, redeemedCount: 0,
    } as never);

    const result = await couponService.validate("PROMO20", 10000);

    expect(result.discountAppliedCents).toBe(2000);
    expect(result.discountedAmountCents).toBe(8000);
  });

  it("calcule correctement une réduction en montant fixe (en unités mineures)", async () => {
    vi.mocked(CouponRepository.prototype.findActiveByCode).mockResolvedValue({
      id: "c4", type: "FIXED_AMOUNT", value: { toNumber: () => 5 }, expiresAt: null,
      maxRedemptions: null, redeemedCount: 0,
    } as never);

    const result = await couponService.validate("MOINS5EUR", 10000);

    expect(result.discountAppliedCents).toBe(500);
    expect(result.discountedAmountCents).toBe(9500);
  });

  it("ne produit jamais un montant négatif si la réduction dépasse le prix", async () => {
    vi.mocked(CouponRepository.prototype.findActiveByCode).mockResolvedValue({
      id: "c5", type: "FIXED_AMOUNT", value: { toNumber: () => 500 }, expiresAt: null,
      maxRedemptions: null, redeemedCount: 0,
    } as never);

    const result = await couponService.validate("ENORME", 1000);

    expect(result.discountedAmountCents).toBe(0);
  });

  it("redeem() incrémente le compteur d'utilisation de manière atomique", async () => {
    const incrementSpy = vi.mocked(CouponRepository.prototype.incrementRedemption).mockResolvedValue({} as never);
    await couponService.redeem("c1");
    expect(incrementSpy).toHaveBeenCalledWith("c1");
  });
});
