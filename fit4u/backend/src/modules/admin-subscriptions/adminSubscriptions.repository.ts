import { BaseRepository } from "../../repositories/base.repository";
import type { CreatePlanInput, CreatePriceInput, ListSubscriptionsQuery, UpdatePlanInput } from "./adminSubscriptions.validators";

export class AdminSubscriptionsRepository extends BaseRepository {
  listPlans() {
    return this.db.subscriptionPlan.findMany({ include: { prices: true }, orderBy: { createdAt: "asc" } });
  }

  createPlan(input: CreatePlanInput) {
    return this.db.subscriptionPlan.create({ data: input });
  }

  updatePlan(id: string, input: UpdatePlanInput) {
    return this.db.subscriptionPlan.update({ where: { id }, data: input });
  }

  findPlanById(id: string) {
    return this.db.subscriptionPlan.findUnique({ where: { id } });
  }

  createPrice(planId: string, input: CreatePriceInput) {
    return this.db.subscriptionPrice.create({ data: { ...input, planId } });
  }

  async listSubscriptions(query: ListSubscriptionsQuery) {
    const { skip, take } = this.buildOffsetPagination(query);
    const where = { status: query.status };
    const [items, total] = await this.db.$transaction([
      this.db.subscription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { user: { include: { profile: true } }, plan: true },
      }),
      this.db.subscription.count({ where }),
    ]);
    return { items, total };
  }

  findSubscriptionById(id: string) {
    return this.db.subscription.findUnique({ where: { id }, include: { user: true, plan: true } });
  }

  updateSubscriptionStatus(id: string, data: { status?: string; cancelAtPeriodEnd?: boolean; canceledAt?: Date }) {
    return this.db.subscription.update({ where: { id }, data: data as never });
  }
}
