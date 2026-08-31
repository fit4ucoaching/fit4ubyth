import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";

import { createApp } from "../../src/app";
import { prisma } from "../../src/database/prisma";

/**
 * Parcours entraînement (Volume 8 §16) :
 * Dashboard → Programme → Séance → Exercice → Fin de séance → Progression
 *
 * Fixtures créées directement via Prisma (catégorie/muscle/exercice) —
 * pattern standard pour un test E2E : l'ARRANGE peut préparer des données
 * de référence hors du périmètre testé, l'ACT/ASSERT passe exclusivement
 * par l'API réelle (aucune route publique de création d'exercice n'existe
 * pour un utilisateur non-admin — cohérent avec le CMS Volume 6).
 */
describe("E2E — Parcours entraînement", () => {
  let accessToken: string;
  let exerciseId: string;

  beforeAll(async () => {
    const app = createApp();
    const email = `e2e-workout-${Date.now()}@fit4u.test`;
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email, password: "MotDePasse123!", firstName: "Test", lastName: "Workout",
    });
    accessToken = registerRes.body.data.tokens.accessToken;

    const category = await prisma.exerciseCategory.create({ data: { name: `Cat E2E ${Date.now()}`, slug: `cat-e2e-${Date.now()}` } });
    const muscle = await prisma.muscleGroup.create({ data: { name: `Muscle E2E ${Date.now()}`, slug: `muscle-e2e-${Date.now()}` } });
    const exercise = await prisma.exercise.create({
      data: {
        name: "Pompes E2E", slug: `pompes-e2e-${Date.now()}`,
        categoryId: category.id, primaryMuscleId: muscle.id, difficultyLevel: "BEGINNER",
      },
    });
    exerciseId = exercise.id;
  });

  it("démarre une séance, la termine, et retrouve la performance dans l'historique", async () => {
    const app = createApp();

    // 1. Démarrer une séance (Dashboard → Séance)
    const startRes = await request(app)
      .post("/api/v1/workouts/start")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Séance E2E", exerciseIds: [exerciseId] });
    expect(startRes.status).toBe(201);
    const workoutSessionId = startRes.body.data.id as string;

    // 2. Terminer la séance (Exercice → Fin de séance)
    const finishRes = await request(app)
      .post("/api/v1/workouts/finish")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        workoutSessionId,
        exercises: [{ exerciseId, setsCompleted: 3, repsCompleted: 12, weightUsedKg: 0 }],
      });
    expect(finishRes.status).toBe(200);
    expect(finishRes.body.data.status).toBe("COMPLETED");

    // 3. Progression — l'historique doit refléter la séance terminée
    const historyRes = await request(app).get("/api/v1/workouts/history").set("Authorization", `Bearer ${accessToken}`);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.items.some((s: { id: string }) => s.id === workoutSessionId)).toBe(true);
  });

  it("refuse de terminer une séance appartenant à un autre utilisateur (accès horizontal — Volume 8 §19)", async () => {
    const app = createApp();
    const otherEmail = `e2e-other-${Date.now()}@fit4u.test`;
    const otherRegisterRes = await request(app).post("/api/v1/auth/register").send({
      email: otherEmail, password: "MotDePasse123!", firstName: "Autre", lastName: "User",
    });
    const otherToken = otherRegisterRes.body.data.tokens.accessToken;

    const startRes = await request(app)
      .post("/api/v1/workouts/start")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Séance privée", exerciseIds: [exerciseId] });
    const workoutSessionId = startRes.body.data.id as string;

    const attackRes = await request(app)
      .post("/api/v1/workouts/finish")
      .set("Authorization", `Bearer ${otherToken}`) // un AUTRE utilisateur tente de terminer la séance
      .send({ workoutSessionId, exercises: [] });

    expect([403, 404]).toContain(attackRes.status); // jamais 200 — l'accès horizontal doit être refusé
  });
});
