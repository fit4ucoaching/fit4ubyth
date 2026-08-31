import express, { type Application } from "express";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import {
  corsMiddleware,
  errorMiddleware,
  globalRateLimiter,
  loggerMiddleware,
  notFoundMiddleware,
  requestIdMiddleware,
  securityMiddleware,
} from "./middleware";
import { healthRouter } from "./routes/health.routes";
import { metricsRouter } from "./routes/metrics.routes";
import { apiRouter } from "./routes";

/**
 * Composition Express — ordre des middlewares volontairement figé et
 * commenté (un mauvais ordre est une source classique de bugs de sécurité
 * silencieux) :
 *   1. requestId       → tout log/erreur qui suit peut s'y référer
 *   2. security/cors    → en-têtes avant tout traitement métier
 *   3. body parsing     → APRÈS security, SAUF les chemins webhook
 *                         (`/payments/webhook`, `/webhooks/shopify`) qui
 *                         nécessitent le corps brut pour la vérification de
 *                         signature HMAC — explicitement exclus du parsing
 *                         JSON global ci-dessous (bug corrigé au Volume 7 :
 *                         `express.json()` global les consommait avant que
 *                         le `express.raw()` propre à chaque route webhook
 *                         ne puisse s'exécuter)
 *   4. rate limiting     → après parsing (IP déjà disponible dès la requête)
 *   5. logger            → englobe tout le traitement pour mesurer la durée réelle
 *   6. routes
 *   7. 404 puis error handler → TOUJOURS en dernier
 */
export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1); // requis pour `req.ip` correct derrière un load balancer

  app.use(requestIdMiddleware);
  app.use(securityMiddleware);
  app.use(corsMiddleware);

  // Le webhook Stripe a besoin du corps brut — sa route déclare déjà son
  // propre `express.raw()` en amont ; express.json() ci-dessous ne
  // s'applique donc qu'aux autres routes grâce à l'ordre de montage Express
  // (le premier middleware à consommer le corps de la requête gagne).
  // BUG CORRIGÉ (Volume 7) : `express.json()` global s'exécutait AVANT que la
  // requête n'atteigne `apiRouter`, donc avant le `express.raw()` posé sur
  // les routes webhook elles-mêmes — le corps était déjà parsé en JSON au
  // moment où Stripe/Shopify tentaient de vérifier leur signature HMAC sur
  // les octets bruts, cassant silencieusement toute vérification de
  // signature. Les chemins webhook sont donc explicitement exclus ici ;
  // leur propre route applique `express.raw()` (voir
  // `modules/payments/payments.routes.ts`, `shopify/shopify.routes.ts`).
  const RAW_BODY_PATHS = [`/api/${env.API_VERSION}/payments/webhook`, `/api/${env.API_VERSION}/webhooks/shopify`];
  app.use((req, res, next) => {
    if (RAW_BODY_PATHS.includes(req.path)) {
      next();
      return;
    }
    express.json({ limit: "2mb" })(req, res, next);
  });
  app.use((req, res, next) => {
    if (RAW_BODY_PATHS.includes(req.path)) {
      next();
      return;
    }
    express.urlencoded({ extended: true })(req, res, next);
  });

  app.use(globalRateLimiter);
  app.use(loggerMiddleware);

  // Fichiers statiques (avatars/photos en stockage disque local — dev uniquement,
  // voir `modules/users/storage.service.ts`).
  app.use("/uploads", express.static("uploads"));

  // Observabilité — hors préfixe /api/v1 (conventions infra standard).
  app.use("/health", healthRouter);
  app.use("/metrics", metricsRouter);

  // Documentation OpenAPI/Swagger.
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

  // API versionnée — /api/v1 aujourd'hui, /api/v2 préparé sans impact sur v1
  // (chaque version future montera son propre `apiRouter` sous son propre préfixe).
  app.use(`/api/${env.API_VERSION}`, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware); // TOUJOURS le dernier middleware

  return app;
}
