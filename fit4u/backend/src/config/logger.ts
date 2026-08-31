import pino from "pino";

import { env, isProduction } from "./env";

/**
 * Logger central — niveaux INFO / WARNING (warn) / ERROR / DEBUG (Volume 1).
 * Aucun `console.log` ailleurs dans le backend : toujours passer par `logger`.
 * Champs structurés systématiques : requestId / userId / route / duration / status
 * sont ajoutés par `middleware/logger.middleware.ts`, jamais recréés ad hoc.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.refreshToken",
      "*.accessToken",
    ],
    censor: "[REDACTED]",
  },
  transport: !isProduction
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
    : undefined,
});
