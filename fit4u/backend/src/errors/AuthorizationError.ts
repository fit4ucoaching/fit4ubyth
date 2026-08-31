import { AppError } from "./AppError";

/** Identité prouvée mais permissions insuffisantes (rôle, VIP, propriété de la ressource). */
export class AuthorizationError extends AppError {
  constructor(message = "Accès refusé", details?: Record<string, unknown>) {
    super({ code: "AUTHORIZATION_ERROR", message, statusCode: 403, details });
  }
}
