import http from "k6/http";
import { check, sleep } from "k6";

/** Smoke test de charge minimale — 1 utilisateur virtuel, vérifie que les endpoints critiques répondent avant tout test de charge réel. */
export const options = { vus: 1, duration: "10s" };

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

export default function () {
  const health = http.get(`${BASE_URL}/health`);
  check(health, { "liveness 200": (r) => r.status === 200 });

  const ready = http.get(`${BASE_URL}/health/ready`);
  check(ready, { "readiness 200": (r) => r.status === 200 });

  sleep(1);
}
