import { BaseRepository } from "../repositories/base.repository";

export class ShopifyRepository extends BaseRepository {
  async ensureCategory(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return this.db.productCategory.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
  }

  upsertProduct(params: {
    shopifyProductId: string;
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    priceCents: number;
    currency: string;
    imageUrl?: string;
    stockQuantity: number;
  }) {
    return this.db.product.upsert({
      where: { shopifyProductId: params.shopifyProductId },
      create: params,
      update: {
        name: params.name,
        description: params.description,
        priceCents: params.priceCents,
        imageUrl: params.imageUrl,
        stockQuantity: params.stockQuantity,
      },
    });
  }

  findOrderByShopifyId(shopifyOrderId: string) {
    return this.db.order.findUnique({ where: { shopifyOrderId } });
  }

  updateOrderStatusByShopifyId(shopifyOrderId: string, status: string) {
    return this.db.order.updateMany({ where: { shopifyOrderId }, data: { status: status as never } });
  }
}
