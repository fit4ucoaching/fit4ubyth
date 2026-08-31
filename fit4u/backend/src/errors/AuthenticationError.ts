import { AppError } from "./AppError";

/** Identité non prouvée (token absent/invalide/expiré, identifiants incorrects). */
export class AuthenticationError extends AppError {
  constructor(message = "Authentification requise", details?: Record<string, unknown>) {
    super({ code: "AUTHENTICATION_ERROR", message, statusCode: 401, details });
  }
}
