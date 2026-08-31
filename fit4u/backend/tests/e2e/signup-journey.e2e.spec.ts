import { describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../../src/app";

/**
 * Parcours inscription (Volume 8 §16) :
 * Landing → Inscription → Email → Connexion → Onboarding → Dashboard
 *
 * "Landing" et "Email" (envoi réel) sortent du périmètre backend testable
 * ici (pages statiques / dépendance SMTP externe, déjà mockée via
 * `emailQueue` en environnement de test — voir `jobs/queue.ts`). Ce test
 * couvre la chaîne API réelle : inscription → connexion → complétion du
 * profil (équivalent backend de l'onboarding) → lecture du dashboard.
 *
 * Nécessite une vraie base PostgreSQL connectée (fournie par les services
 * Docker de `ci.yml` en CI) — ce n'est PAS un test unitaire mocké.
 */
describe("E2E — Parcours inscription", () => {
  it("inscription → connexion → complétion profil → lecture du profil complet", async () => {
    const app = createApp();
    const email = `e2e-signup-${Date.now()}@fit4u.test`;

    // 1. Inscription
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email, password: "MotDePasse123!", firstName: "Test", lastName: "E2E",
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.tokens.accessToken).toBeTruthy();

    const accessToken = registerRes.body.data.tokens.accessToken as string;

    // 2. Connexion (vérifie que le compte est bien utilisable immédiatement après inscription)
    const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password: "MotDePasse123!" });
    expect(loginRes.status).toBe(200);

    // 3. Complétion du profil (équivalent backend de l'onboarding, Volume 4)
    const profileRes = await request(app)
      .put("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ heightCm: 178 });
    expect(profileRes.status).toBe(200);

    // 4. Lecture du "dashboard" — /users/me doit refléter le profil complété
    const meRes = await request(app).get("/api/v1/users/me").set("Authorization", `Bearer ${accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.profile.heightCm).toBe(178);
  });

  it("refuse une seconde inscription avec le même email (pas de doublon silencieux)", async () => {
    const app = createApp();
    const email = `e2e-dup-${Date.now()}@fit4u.test`;
    const payload = { email, password: "MotDePasse123!", firstName: "Test", lastName: "Dup" };

    await request(app).post("/api/v1/auth/register").send(payload);
    const secondAttempt = await request(app).post("/api/v1/auth/register").send(payload);

    expect(secondAttempt.status).toBe(409);
  });
});
