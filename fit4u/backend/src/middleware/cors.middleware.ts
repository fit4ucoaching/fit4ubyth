import cors from "cors";

import { env, isProduction } from "../config/env";

const ALLOWED_ORIGINS = [env.WEB_APP_URL, "http://localhost:5173", "http://localhost:5174"];

/**
 * CORS restreint aux origines connues (web, admin) en production. En
 * développement/test, toute origine est acceptée pour ne pas bloquer les
 * outils locaux (Expo, Postman…).
 */
export const corsMiddleware = cors({
  origin: isProduction ? ALLOWED_ORIGINS : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});
