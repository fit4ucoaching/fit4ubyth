import { ValidationError } from "../errors";
import { CouponRepository } from "../repositories/coupon.repository";

const couponRepository = new CouponRepository();

export interface CouponValidationResult {
  couponId: string;
  discountedAmountCents: number;
  discountAppliedCents: number;
}

/**
 * Validation/rédemption de coupons (Volume 7 §23) — service PARTAGÉ entre
 * la Boutique (`shop.service.ts`, checkout d'`Order`) et les Abonnements
 * (`subscriptions.service.ts`) : un même moteur de calcul, jamais deux
 * implémentations divergentes du pourcentage/montant fixe.
 *
 * "Ne jamais considérer le prix envoyé par le client comme fiable" (§36-37) :
 * ce service recalcule TOUJOURS la réduction côté serveur à partir du
 * montant serveur (`amountCents` doit provenir du catalogue interne,
 * jamais d'un champ du corps de requête client).
 */
export const couponService = {
  /**
   * Valide un code et calcule le montant réduit. Ne redeem PAS
   * automatiquement (voir `redeem()`) — permet d'afficher un aperçu du
   * prix avant confirmation de commande/abonnement sans consommer le
   * coupon en cas d'abandon du panier.
   */
  async validate(code: string, amountCents: number): Promise<CouponValidationResult> {
    const coupon = await couponRepository.findActiveByCode(code);
    if (!coupon) {
      throw new ValidationError("Coupon invalide ou inactif.");
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ValidationError("Ce coupon a expiré.");
    }
    if (coupon.maxRedemptions !== null && coupon.redeemedCount >= coupon.maxRedemptions) {
      throw new ValidationError("Ce coupon a atteint son nombre maximal d'utilisations.");
    }

    const discountAppliedCents =
      coupon.type === "PERCENTAGE"
        ? Math.round((amountCents * coupon.value.toNumber()) / 100)
        : Math.round(coupon.value.toNumber() * 100);

    const discountedAmountCents = Math.max(0, amountCents - discountAppliedCents);

    return { couponId: coupon.id, discountedAmountCents, discountAppliedCents };
  },

  /** Consomme réellement le coupon — appelé uniquement après confirmation effective du paiement. */
  redeem(couponId: string) {
    return couponRepository.incrementRedemption(couponId);
  },
};
