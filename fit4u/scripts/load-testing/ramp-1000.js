import http from "k6/http";
import { check, sleep } from "k6";

/** Palier 1 000 utilisateurs (Volume 8 §22) — à exécuter seulement après validation du palier 100. */
export const options = {
  stages: [
    { duration: "1m", target: 1000 },
    { duration: "3m", target: 1000 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"], // seuil relâché vs palier 100 — à ajuster selon l'infrastructure réelle
    http_req_failed: ["rate<0.02"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/exercises`);
  check(res, { "200 OK": (r) => r.status === 200 });
  sleep(Math.random() * 2 + 1);
}
