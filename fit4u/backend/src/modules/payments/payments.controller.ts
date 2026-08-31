import type { Request, Response } from "express";
import Stripe from "stripe";

import { env } from "../../config/env";
import { ValidationError } from "../../errors";
import { logger } from "../../config/logger";
import { webhookEventService } from "../../services/webhookEvent.service";
import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { sendPaginated, sendSuccess } from "../../utils/apiResponse";
import { stripe } from "./payments.service";
import type { PaymentsService } from "./payments.service";
import type { CreateIntentInput, RefundInput } from "./payments.validators";

const SUBSCRIPTION_EVENT_TYPES = new Set([
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

const subscriptionsService = new SubscriptionsService(new SubscriptionsRepository());

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  createIntent = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.paymentsService.createIntent(req.user!.id, req.body as CreateIntentInput), 201);
  };

  /**
   * Le corps de cette route est monté en `express.raw()` (voir `app.ts`) —
   * requis par Stripe pour vérifier la signature HMAC du webhook avant tout
   * parsing JSON, qui altérerait les octets bruts signés.
   *
   * Idempotence (Volume 7 §16) : chaque événement est d'abord vérifié
   * contre `WebhookEvent` (déjà traité ? → ignorer) puis enregistré AVANT
   * traitement métier — un crash pendant le traitement laisse une trace
   * "PENDING" exploitable, jamais un événement silencieusement perdu.
   *
   * Un seul endpoint Stripe reçoit tous les événements (convention Stripe) :
   * le dispatch se fait ici par `event.type` vers le service du domaine
   * concerné (Boutique vs Abonnements — Volume 7 §40), jamais mélangé.
   */
  webhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      throw new ValidationError("Signature Stripe manquante.");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.warn({ err }, "Signature de webhook Stripe invalide");
      throw new ValidationError("Signature de webhook invalide.");
    }

    if (await webhookEventService.isDuplicate("stripe", event.id)) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    const record = await webhookEventService.recordIncoming({
      provider: "stripe",
      externalEventId: event.id,
      eventType: event.type,
      payload: event as unknown,
    });

    try {
      if (SUBSCRIPTION_EVENT_TYPES.has(event.type)) {
        await subscriptionsService.handleStripeEvent(event as never);
      } else {
        await this.paymentsService.handleStripeWebhook(event);
      }
      if (record) await webhookEventService.markProcessed(record.id);
    } catch (err) {
      if (record) await webhookEventService.markFailed(record.id, err instanceof Error ? err.message : "Erreur inconnue");
      throw err;
    }

    res.status(200).json({ received: true });
  };

  history = async (req: Request, res: Response): Promise<void> => {
    const { items, total } = await this.paymentsService.history(req.user!.id, {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
    sendPaginated(res, items, {
      total,
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
    });
  };

  refund = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.paymentsService.refund(req.user!.id, req.body as RefundInput));
  };
}
