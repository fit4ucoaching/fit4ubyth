import helmet from "helmet";

/**
 * En-têtes de sécurité HTTP (Helmet) — CSP volontairement stricte, ajustée
 * uniquement pour permettre le chargement des assets nécessaires (Swagger UI
 * en développement).
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
