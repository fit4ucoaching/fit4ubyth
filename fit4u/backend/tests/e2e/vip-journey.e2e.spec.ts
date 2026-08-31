import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";

import { createApp } from "../../src/app";
import { prisma } from "../../src/database/prisma";

/**
 * Parcours VIP (Volume 8 §16) :
 * Admin → Ajout email VIP → Utilisateur → Connexion → Entitlement VIP → Accès Premium
 *
 * Contrairement au parcours Premium, aucun webhook n'intervient ici —
 * l'octroi VIP est une action administrative directe (Volume 7 §7). Ce
 * test simule l'action admin via `vipAccessService` directement (le
 * contrôle d'accès de la ROUTE admin elle-même — RBAC, permissions — est
 * déjà testé indépendamment dans `security.entitlements.spec.ts` et les
 * tests du module admin-users) : ce test se concentre sur l'effet de bout
 * en bout de l'octroi, pas sur l'autorisation d'y accéder.
 */
describe("E2E — Parcours VIP", () => {
  let adminFixtureId: string;

  beforeAll(async () => {
    // VipAccess.createdBy est une vraie FK vers User (pas une chaîne libre)
    // — un utilisateur "admin" fixture doit exister pour satisfaire la contrainte.
    const adminFixture = await prisma.user.create({
      data: {
        email: `admin-fixture-vip-e2e-${Date.now()}@fit4u.test`,
        passwordHash: "not-a-real-hash-fixture-only",
        authProvider: "EMAIL",
        profile: { create: { firstName: "Admin", lastName: "Fixture" } },
      },
    });
    adminFixtureId = adminFixture.id;
  });

  it("email ajouté en VIP AVANT inscription → l'utilisateur obtient l'accès VIP dès sa première connexion", async () => {
    const app = createApp();
    const email = `e2e-vip-${Date.now()}@fit4u.test`;

    // 1. Admin ajoute l'email en VIP — AVANT même que le compte n'existe (Volume 7 §7 : "avant même l'inscription").
    const { vipAccessService } = await import("../../src/services/vipAccess.service");
    await vipAccessService.grant({ email, isLifetime: true, startDate: new Date(), createdBy: adminFixtureId });

    // 2. L'utilisateur s'inscrit avec cette même adresse.
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email, password: "MotDePasse123!", firstName: "Test", lastName: "VIP",
    });
    expect(registerRes.status).toBe(201);
    const accessToken = registerRes.body.data.tokens.accessToken as string;

    // 3. Entitlement VIP actif dès la première connexion — aucune étape de paiement.
    const summaryRes = await request(app).get("/api/v1/entitlements/me").set("Authorization", `Bearer ${accessToken}`);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.accessLevel).toBe("VIP");
    expect(summaryRes.body.data.source).toBe("vip");
  });

  it("révocation VIP → l'accès Premium disparaît à la prochaine vérification (jamais après le fait, jamais en attendant un job)", async () => {
    const app = createApp();
    const email = `e2e-vip-revoke-${Date.now()}@fit4u.test`;

    const { vipAccessService } = await import("../../src/services/vipAccess.service");
    const vipAccess = await vipAccessService.grant({ email, isLifetime: true, startDate: new Date(), createdBy: adminFixtureId });

    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email, password: "MotDePasse123!", firstName: "Test", lastName: "Revoked",
    });
    const accessToken = registerRes.body.data.tokens.accessToken as string;

    const beforeRevoke = await request(app).get("/api/v1/entitlements/me").set("Authorization", `Bearer ${accessToken}`);
    expect(beforeRevoke.body.data.accessLevel).toBe("VIP");

    // Révocation admin (Volume 7 §10).
    await vipAccessService.revoke(vipAccess.id);

    const afterRevoke = await request(app).get("/api/v1/entitlements/me").set("Authorization", `Bearer ${accessToken}`);
    expect(afterRevoke.body.data.accessLevel).toBe("FREE"); // recalcul immédiat, sans job de fond
  });

  it("VIP temporaire déjà expiré → n'accorde jamais l'accès, même le jour de l'octroi si endDate est déjà passée", async () => {
    const app = createApp();
    const email = `e2e-vip-expired-${Date.now()}@fit4u.test`;

    // Insertion directe pour simuler une VIP dont la fenêtre est déjà révolue
    // (cas limite : import CSV avec une date de fin erronée par exemple).
    await prisma.vipAccess.create({
      data: { email, isLifetime: false, startDate: new Date("2020-01-01"), endDate: new Date("2020-06-01"), createdBy: adminFixtureId },
    });

    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email, password: "MotDePasse123!", firstName: "Test", lastName: "Expired",
    });
    const accessToken = registerRes.body.data.tokens.accessToken as string;

    const summaryRes = await request(app).get("/api/v1/entitlements/me").set("Authorization", `Bearer ${accessToken}`);
    expect(summaryRes.body.data.accessLevel).toBe("FREE"); // jamais VIP pour une fenêtre déjà passée
  });
});
