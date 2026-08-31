import { AppError } from "./AppError";

/** Quota de requêtes dépassé — utilisée par `rateLimit.middleware.ts` et la protection brute force. */
export class RateLimitError extends AppError {
  constructor(message = "Trop de requêtes, réessayez plus tard.", details?: Record<string, unknown>) {
    super({ code: "RATE_LIMIT_EXCEEDED", message, statusCode: 429, details });
  }
}
