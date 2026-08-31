import { BaseRepository } from "./base.repository";

export class WebhookEventRepository extends BaseRepository {
  findByExternalId(provider: string, externalEventId: string) {
    return this.db.webhookEvent.findUnique({ where: { provider_externalEventId: { provider, externalEventId } } });
  }

  create(data: { provider: string; externalEventId: string; eventType: string; payload: unknown }) {
    return this.db.webhookEvent.create({ data: data as never });
  }

  markProcessed(id: string) {
    return this.db.webhookEvent.update({ where: { id }, data: { status: "PROCESSED", processedAt: new Date() } });
  }

  markFailed(id: string, error: string) {
    return this.db.webhookEvent.update({ where: { id }, data: { status: "FAILED", error } });
  }
}
