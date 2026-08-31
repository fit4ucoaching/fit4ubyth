import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../repositories/webhookEvent.repository");

import { WebhookEventRepository } from "../../repositories/webhookEvent.repository";
import { webhookEventService } from "../webhookEvent.service";

/**
 * Tests webhooks (Volume 7 §49) — événement dupliqué, événement valide,
 * erreur temporaire. La vérification de signature elle-même est testée
 * séparément par prestataire (`shopifyWebhookVerify.spec.ts`) — ce fichier
 * couvre uniquement le contrat d'idempotence, commun à tous les prestataires.
 */
describe("webhookEventService — idempotence (Volume 7 §16)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isDuplicate renvoie false pour un événement jamais vu", async () => {
    vi.mocked(WebhookEventRepository.prototype.findByExternalId).mockResolvedValue(null);
    const result = await webhookEventService.isDuplicate("stripe", "evt_new");
    expect(result).toBe(false);
  });

  it("isDuplicate renvoie true pour un événement déjà PROCESSED (rejeu à ignorer)", async () => {
    vi.mocked(WebhookEventRepository.prototype.findByExternalId).mockResolvedValue({ status: "PROCESSED" } as never);
    const result = await webhookEventService.isDuplicate("stripe", "evt_already_done");
    expect(result).toBe(true);
  });

  it("isDuplicate renvoie false pour un événement PENDING (échec précédent, à retraiter — pas un vrai doublon)", async () => {
    vi.mocked(WebhookEventRepository.prototype.findByExternalId).mockResolvedValue({ status: "PENDING" } as never);
    const result = await webhookEventService.isDuplicate("stripe", "evt_pending");
    expect(result).toBe(false);
  });

  it("recordIncoming persiste l'événement AVANT tout traitement métier", async () => {
    const createSpy = vi.mocked(WebhookEventRepository.prototype.create).mockResolvedValue({ id: "rec1" } as never);

    await webhookEventService.recordIncoming({
      provider: "stripe", externalEventId: "evt_1", eventType: "invoice.paid", payload: { foo: "bar" },
    });

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ provider: "stripe", externalEventId: "evt_1" }));
  });

  it("recordIncoming absorbe une violation de contrainte unique (race condition) sans lever d'exception", async () => {
    vi.mocked(WebhookEventRepository.prototype.create).mockRejectedValue(new Error("unique constraint violation"));

    const result = await webhookEventService.recordIncoming({
      provider: "stripe", externalEventId: "evt_race", eventType: "invoice.paid", payload: {},
    });

    expect(result).toBeNull(); // traité comme doublon plutôt que de faire échouer le webhook entier
  });

  it("markFailed journalise l'erreur associée à l'événement (erreur temporaire — Volume 7 §49)", async () => {
    const failSpy = vi.mocked(WebhookEventRepository.prototype.markFailed).mockResolvedValue({} as never);

    await webhookEventService.markFailed("rec1", "Timeout base de données");

    expect(failSpy).toHaveBeenCalledWith("rec1", "Timeout base de données");
  });

  it("markProcessed marque l'événement comme traité avec horodatage", async () => {
    const processSpy = vi.mocked(WebhookEventRepository.prototype.markProcessed).mockResolvedValue({} as never);

    await webhookEventService.markProcessed("rec1");

    expect(processSpy).toHaveBeenCalledWith("rec1");
  });
});
