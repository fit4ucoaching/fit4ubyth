import { logger } from "../config/logger";
import { WebhookEventRepository } from "../repositories/webhookEvent.repository";

const webhookEventRepository = new WebhookEventRepository();

/**
 * Idempotence des webhooks (Volume 7 §16) — "Event déjà traité ? Oui →
 * ignorer. Non → traiter." `@@unique([provider, externalEventId])` au
 * schéma est la garantie ultime (une tentative de double-insertion échoue
 * au niveau base de données même en cas de race condition entre deux
 * requêtes concurrentes) ; ce service ajoute la vérification applicative
 * précoce pour éviter un traitement métier inutile.
 */
export const webhookEventService = {
  /** Retourne `true` si l'événement a déjà été traité (à ignorer), `false` sinon (à traiter). */
  async isDuplicate(provider: string, externalEventId: string): Promise<boolean> {
    const existing = await webhookEventRepository.findByExternalId(provider, externalEventId);
    return existing !== null && existing.status === "PROCESSED";
  },

  /**
   * Enregistre l'événement AVANT traitement (traçabilité même en cas de
   * crash pendant le traitement métier — voir §51 : observabilité).
   * `create()` échoue naturellement sur une contrainte unique si un doublon
   * a été enregistré entre `isDuplicate()` et cet appel (race condition
   * rarissime mais couverte par le schéma, pas seulement le code).
   */
  async recordIncoming(params: { provider: string; externalEventId: string; eventType: string; payload: unknown }) {
    try {
      return await webhookEventRepository.create(params);
    } catch {
      logger.warn({ provider: params.provider, externalEventId: params.externalEventId }, "Webhook déjà enregistré (contrainte unique) — traité comme doublon.");
      return null;
    }
  },

  markProcessed(id: string) {
    return webhookEventRepository.markProcessed(id);
  },

  markFailed(id: string, error: string) {
    logger.error({ webhookEventId: id, error }, "Échec de traitement d'un webhook");
    return webhookEventRepository.markFailed(id, error);
  },
};
