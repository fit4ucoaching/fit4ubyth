import { BaseRepository } from "./base.repository";

export class CouponRepository extends BaseRepository {
  findActiveByCode(code: string) {
    return this.db.coupon.findFirst({ where: { code, isActive: true } });
  }

  /** Incrémentation atomique — évite une race condition entre deux rédemptions simultanées du même coupon proche de sa limite. */
  incrementRedemption(id: string) {
    return this.db.coupon.update({ where: { id }, data: { redeemedCount: { increment: 1 } } });
  }
}
