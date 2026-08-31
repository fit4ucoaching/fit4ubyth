import { AppError } from "./AppError";

/** Corps de requête / paramètres invalides (échec de validation Zod). */
export class ValidationError extends AppError {
  constructor(message = "Données invalides", details?: Record<string, unknown>) {
    super({ code: "VALIDATION_ERROR", message, statusCode: 422, details });
  }
}
