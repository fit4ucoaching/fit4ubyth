import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";

import { createApp } from "../../src/app";
import { prisma } from "../../src/database/prisma";

/**
 * Parcours Premium (Volume 8 §16) :
 * Free → Premium → Checkout → Paiement → Webhook → Entitlement → Fonctionnalité débloquée
 *
 * Le checkout Stripe réel n'est PAS appelé ici (nécessiterait une vraie clé
 * API + réseau externe, non désirable en CI — Volume 8 §15 : "intégrations
 * externes... via environnements de test ou mocks contrôlés"). Ce test
 * simule le point de confiance critique : l'ARRIVÉE du webhook de
 * confirmation, exactement comme Stripe l'enverrait après un paiement
 * réel, et vérifie que le reste de la chaîne (résolution d'Entitlement,
 * déblocage de fonctionnalité) fonctionne réellement à partir de ce
 * signal — jamais à partir d'une simple réponse frontend (Volume 7 §14).
 */
describe("E2E — Parcours Premium", () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const app = createApp();
    const email = `e2e-premium-${Date.now()}@fit4u.test`;
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email, password: "MotDePasse123!", firstName: "Test", lastName: "Premium",
    });
    accessToken = registerRes.body.data.tokens.accessToken;
    userId = registerRes.body.data.user.id;

    // Fixture : la FeatureDefinition doit exister pour que la fonctionnalité
    // soit évaluable (fail-closed — voir entitlement.service.ts).
    await prisma.featureDefinition.upsert({
      where: { key: "nutrition.advanced_ai" },
      create: { key: "nutrition.advanced_ai", minimumLevel: "PREMIUM", isActive: true },
      update: { isActive: true, minimumLevel: "PREMIUM" },
    });

    // Fixture : plan d'abonnement (catalogue interne, Volume 7 §13) pour associer la Subscription créée.
    const plan = await prisma.subscriptionPlan.upsert({
      where: { key: "FIT4U_PREMIUM_MONTHLY_E2E" },
      create: { key: "FIT4U_PREMIUM_MONTHLY_E2E", name: "Premium mensuel (E2E)", accessLevel: "PREMIUM", isActive: true },
      update: {},
    });

    // Simule l'état "checkout initié" (ce que POST /subscriptions aurait
    // créé après un vrai appel Stripe) — statut INCOMPLETE, aucun droit encore accordé.
    await prisma.subscription.create({
      data: {
        userId, planId: plan.id, provider: "stripe",
        providerSubscriptionId: `sub_e2e_${Date.now()}`, status: "INCOMPLETE",
      },
    });
  });

  it("Free : la fonctionnalité Premium est refusée avant tout paiement", async () => {
    const app = createApp();

    const summaryRes = await request(app).get("/api/v1/entitlements/me").set("Authorization", `Bearer ${accessToken}`);
    expect(summaryRes.body.data.accessLevel).toBe("FREE");

    const featureRes = await request(app)
      .post("/api/v1/teddy/generate-nutrition")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mealsPerDay: 3 });
    expect(featureRes.status).toBe(403);
  });

  it("Webhook Stripe confirmant le paiement → Entitlement PREMIUM → fonctionnalité débloquée", async () => {
    const app = createApp();
    const subscription = await prisma.subscription.findFirst({ where: { userId } });

    // Simule directement le traitement du webhook (la vérification de
    // signature elle-même est testée séparément, voir
    // `shopify.service.spec.ts`/`payments.controller` pour le pattern
    // équivalent Stripe — ici on teste la RÉACTION au webhook, pas sa
    // sécurité d'entrée, déjà couverte ailleurs).
    const { SubscriptionsService } = await import("../../src/modules/subscriptions/subscriptions.service");
    const { SubscriptionsRepository } = await import("../../src/modules/subscriptions/subscriptions.repository");
    const subscriptionsService = new SubscriptionsService(new SubscriptionsRepository());

    await subscriptionsService.handleStripeEvent({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: subscription!.providerSubscriptionId,
          status: "active",
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          cancel_at_period_end: false,
        },
      },
    } as never);

    // Entitlement recalculé — fraîchement, sans attendre de refresh token (Volume 7).
    const summaryRes = await request(app).get("/api/v1/entitlements/me").set("Authorization", `Bearer ${accessToken}`);
    expect(summaryRes.body.data.accessLevel).toBe("PREMIUM");

    // Fonctionnalité débloquée — même token qu'à l'étape Free (aucune reconnexion nécessaire).
    const featureRes = await request(app)
      .post("/api/v1/teddy/generate-nutrition")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mealsPerDay: 3 });
    expect(featureRes.status).not.toBe(403);
  });
});
