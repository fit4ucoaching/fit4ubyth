import { BaseRepository } from "../../repositories/base.repository";

export class ShopRepository extends BaseRepository {
  async findProducts(params: { page: number; pageSize: number; categoryId?: string }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { deletedAt: null, isActive: true, categoryId: params.categoryId };
    const [items, total] = await this.db.$transaction([
      this.db.product.findMany({ where, skip, take, include: { category: true } }),
      this.db.product.count({ where }),
    ]);
    return { items, total };
  }

  findProductById(id: string) {
    return this.db.product.findFirst({ where: { id, deletedAt: null } });
  }

  async getOrCreateCart(userId: string) {
    const existing = await this.db.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (existing) return existing;
    return this.db.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  async addCartItem(cartId: string, productId: string, quantity: number) {
    return this.db.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  findCouponByCode(code: string) {
    return this.db.coupon.findUnique({ where: { code } });
  }

  async createOrderFromCart(params: {
    userId: string;
    items: { productId: string; quantity: number; unitPriceCents: number }[];
    couponId?: string;
    discountCents: number;
    shippingAddress: Record<string, unknown>;
  }) {
    const subtotalCents = params.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
    const totalCents = Math.max(0, subtotalCents - params.discountCents);

    return this.db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: params.userId,
          status: "PENDING",
          couponId: params.couponId,
          subtotalCents,
          discountCents: params.discountCents,
          totalCents,
          shippingAddress: params.shippingAddress,
          items: {
            create: params.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cart: { userId: params.userId } } });

      if (params.couponId) {
        await tx.coupon.update({ where: { id: params.couponId }, data: { redeemedCount: { increment: 1 } } });
      }

      return order;
    });
  }

  async findOrders(userId: string, params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { userId, deletedAt: null };
    const [items, total] = await this.db.$transaction([
      this.db.order.findMany({ where, skip, take, include: { items: true }, orderBy: { createdAt: "desc" } }),
      this.db.order.count({ where }),
    ]);
    return { items, total };
  }
}
