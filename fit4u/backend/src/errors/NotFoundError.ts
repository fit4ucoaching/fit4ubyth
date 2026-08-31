import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable", details?: Record<string, unknown>) {
    super({ code: "NOT_FOUND", message, statusCode: 404, details });
  }
}
