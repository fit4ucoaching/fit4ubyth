import { BaseRepository } from "../../repositories/base.repository";

export class PaymentsRepository extends BaseRepository {
  findOrderById(orderId: string, userId: string) {
    return this.db.order.findFirst({ where: { id: orderId, userId, deletedAt: null } });
  }

  createPayment(params: {
    orderId: string;
    userId: string;
    provider: string;
    providerTransactionId?: string;
    amountCents: number;
    currency: string;
  }) {
    return this.db.payment.create({ data: { ...params, status: "PENDING" } });
  }

  updatePaymentStatus(providerTransactionId: string, status: "PENDING" | "PAID" | "FAILED" | "REFUNDED") {
    return this.db.payment.updateMany({ where: { providerTransactionId }, data: { status } });
  }

  findPaymentById(id: string) {
    return this.db.payment.findUnique({ where: { id } });
  }

  markOrderPaid(orderId: string) {
    return this.db.order.update({ where: { id: orderId }, data: { status: "PROCESSING" } });
  }

  async findHistory(userId: string, params: { page: number; pageSize: number }) {
    const { skip, take } = this.buildOffsetPagination(params);
    const where = { userId };
    const [items, total] = await this.db.$transaction([
      this.db.payment.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.db.payment.count({ where }),
    ]);
    return { items, total };
  }
}
