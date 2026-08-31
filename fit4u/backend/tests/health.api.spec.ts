import { describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../src/app";

/**
 * Test API (Supertest) de référence — vérifie le contrat HTTP réel de bout
 * en bout (`createApp()` monte l'intégralité des middlewares/routes),
 * contrairement aux tests unitaires de service qui mockent le repository.
 */
describe("GET /health", () => {
  it("répond 200 avec le format de succès uniforme", async () => {
    const app = createApp();
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { status: "alive" } });
  });
});

describe("Routes protégées", () => {
  it("rejette une requête sans token avec le format d'erreur uniforme", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/users/me");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      error: { code: "AUTHENTICATION_ERROR" },
    });
    expect(res.body.error.requestId).toBeTruthy();
  });
});
