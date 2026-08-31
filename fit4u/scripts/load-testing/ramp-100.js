import http from "k6/http";
import { check, sleep } from "k6";

/** Palier 100 utilisateurs (Volume 8 §22) — montée progressive puis palier stable. */
export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "2m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // Volume 8 §60 : budget de latence API
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/exercises`);
  check(res, { "200 OK": (r) => r.status === 200 });
  sleep(Math.random() * 2 + 1); // simule un temps de lecture réaliste entre requêtes
}
