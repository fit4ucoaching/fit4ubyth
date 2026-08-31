import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Objectif de couverture élevée sur la logique métier critique
      // (Volume 3) — services et repositories, pas les fichiers de simple
      // câblage (routes, index).
      include: ["src/modules/**/*.service.ts", "src/modules/**/*.repository.ts", "src/ai/**/*.ts"],
    },
  },
});
