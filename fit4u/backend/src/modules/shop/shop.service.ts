import { NotFoundError, ValidationError } from "../../errors";
import type { ShopRepository } from "./shop.repository";
import type { AddCartItemInput, CheckoutInput } from "./shop.validators";

export class ShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  products(params: { page: number; pageSize: number; categoryId?: string }) {
    return this.shopRepository.findProducts(params);
  }

  async productById(id: string) {
    const product = await this.shopRepository.findProductById(id);
    if (!product) throw new NotFoundError("Produit introuvable.");
    return product;
  }

  cart(userId: string) {
    return this.shopRepository.getOrCreateCart(userId);
  }

  async addCartItem(userId: string, input: AddCartItemInput) {
    const product = await this.productById(input.productId); // 404 si absent
    if (product.stockQuantity < input.quantity) {
      throw new ValidationError("Stock insuffisant pour ce produit.");
    }

    const cart = await this.shopRepository.getOrCreateCart(userId);
    return this.shopRepository.addCartItem(cart.id, input.productId, input.quantity);
  }

  async checkout(userId: string, input: CheckoutInput) {
    const cart = await this.shopRepository.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      throw new ValidationError("Le panier est vide.");
    }

    let couponId: string | undefined;
    let discountCents = 0;

    if (input.couponCode) {
      const coupon = await this.shopRepository.findCouponByCode(input.couponCode);
      if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date())) {
        throw new ValidationError("Coupon invalide ou expiré.");
      }
      couponId = coupon.id;
      const subtotal = cart.items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
      discountCents =
        coupon.type === "PERCENTAGE"
          ? Math.round((subtotal * coupon.value.toNumber()) / 100)
          : Math.round(coupon.value.toNumber() * 100);
    }

    const order = await this.shopRepository.createOrderFromCart({
      userId,
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPriceCents: i.product.priceCents,
      })),
      couponId,
      discountCents,
      shippingAddress: input.shippingAddress,
    });

    // La confirmation du paiement (Stripe/PayPal/Apple Pay/Google Pay) se fait
    // via `modules/payments` — cet endpoint ne fait que créer la commande en
    // statut PENDING, jamais de logique de paiement (séparation des responsabilités).
    return order;
  }

  orders(userId: string, params: { page: number; pageSize: number }) {
    return this.shopRepository.findOrders(userId, params);
  }
}
