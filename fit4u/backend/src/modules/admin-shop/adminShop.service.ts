import { NotFoundError } from "../../errors";
import { auditLogService } from "../../services/auditLog.service";
import type { AdminShopRepository } from "./adminShop.repository";
import type { ListOrdersQuery, ListProductsQuery, ToggleProductActiveInput } from "./adminShop.validators";

/** Gestion admin de la Boutique (Volume 6, gap partiellement comblé) — catalogue en lecture (source Shopify) + visibilité locale + commandes. */
export class AdminShopService {
  constructor(private readonly repository: AdminShopRepository) {}

  listProducts(query: ListProductsQuery) {
    return this.repository.listProducts(query);
  }

  async toggleProductActive(adminId: string, productId: string, input: ToggleProductActiveInput) {
    const product = await this.repository.findProductById(productId);
    if (!product) throw new NotFoundError("Produit introuvable.");

    const updated = await this.repository.toggleProductActive(productId, input.isActive);

    await auditLogService.record({
      performedBy: adminId,
      action: input.isActive ? "PRODUCT_ACTIVATED" : "PRODUCT_DEACTIVATED",
      targetType: "Product",
      targetId: productId,
      before: { isActive: product.isActive },
      after: { isActive: input.isActive },
    });

    return updated;
  }

  listOrders(query: ListOrdersQuery) {
    return this.repository.listOrders(query);
  }

  async getOrderDetail(orderId: string) {
    const order = await this.repository.findOrderById(orderId);
    if (!order) throw new NotFoundError("Commande introuvable.");
    return order;
  }
}
