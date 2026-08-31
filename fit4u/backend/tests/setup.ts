import { afterAll, beforeAll, vi } from "vitest";

// Variables d'environnement minimales pour que `config/env.ts` ne bloque pas
// le démarrage pendant les tests (voir le mode non-production de `loadEnv()`).
process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://fit4u:fit4u@localhost:5432/fit4u_test";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.JWT_SECRET ??= "test-jwt-secret-please-change-in-prod-32chars";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-please-change-32chars";

beforeAll(() => {
  vi.setConfig({ testTimeout: 10_000 });
});

afterAll(() => {
  vi.restoreAllMocks();
});
