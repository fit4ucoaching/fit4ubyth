import swaggerJSDoc from "swagger-jsdoc";

import { env } from "./env";

/**
 * Configuration OpenAPI/Swagger — la documentation est générée à partir des
 * commentaires JSDoc `@openapi` présents dans chaque `*.routes.ts`, jamais
 * maintenue séparément du code (source unique de vérité).
 */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Fit4U by TH — API",
      version: "1.0.0",
      description:
        "API SaaS Fit4U by TH — fitness, nutrition, Coach IA Teddy, gamification, communauté, boutique.",
    },
    servers: [{ url: `${env.APP_URL}/api/${env.API_VERSION}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/ai/*.routes.ts"],
});
