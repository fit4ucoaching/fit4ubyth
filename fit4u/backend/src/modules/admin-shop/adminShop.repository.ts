import { BaseRepository } from "../../repositories/base.repository";
import type { ListOrdersQuery, ListProductsQuery } from "./adminShop.validators";

/**
 * Repository admin-shop — Product/ProductCategory sont synchronisés depuis
 * Shopify (`ShopifyService`, Volume 7 §32 : "Shopify reste la source de
 * vérité"). Ce repository n'écrit JAMAIS sur `name`/`priceCents`/
 * `stockQuantity`/etc. — uniquement `isActive`, un flag LOCAL à Fit4U
 * (visibilité dans l'app) sans équivalent côté Shopify, donc jamais en
 * conflit avec une resynchronisation.
 */
export class AdminShopRepository extends BaseRepository {
  async listProducts(query: ListProductsQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where = {
      deletedAt: null,
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.product.findMany({ where, skip, take, include: { category: true }, orderBy: { name: "asc" } }),
      this.db.product.count({ where }),
    ]);
    return { items, total };
  }

  findProductById(id: string) {
    return this.db.product.findFirst({ where: { id, deletedAt: null } });
  }

  toggleProductActive(id: string, isActive: boolean) {
    return this.db.product.update({ where: { id }, data: { isActive } });
  }

  async listOrders(query: ListOrdersQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where = { status: query.status, deletedAt: null };
    const [items, total] = await this.db.$transaction([
      this.db.order.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: { user: { include: { profile: true } }, items: { include: { product: true } } },
      }),
      this.db.order.count({ where }),
    ]);
    return { items, total };
  }

  findOrderById(id: string) {
    return this.db.order.findFirst({
      where: { id, deletedAt: null },
      include: { user: { include: { profile: true } }, items: { include: { product: true } }, coupon: true },
    });
  }
}
