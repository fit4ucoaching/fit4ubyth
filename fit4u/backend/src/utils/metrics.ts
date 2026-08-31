import client from "prom-client";

/**
 * Registre Prometheus (`prom-client`) — exposé via `GET /metrics`
 * (Volume 3 : Observabilité). Métriques par défaut Node.js (event loop,
 * mémoire, GC) + métriques HTTP applicatives ci-dessous.
 */
export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: "fit4u_http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

export const httpRequestsTotal = new client.Counter({
  name: "fit4u_http_requests_total",
  help: "Nombre total de requêtes HTTP",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(httpRequestsTotal);
