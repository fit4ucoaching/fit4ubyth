import { AppError } from "./AppError";

/** État déjà existant en conflit (email déjà utilisé, code coupon déjà pris…). */
export class ConflictError extends AppError {
  constructor(message = "Conflit de données", details?: Record<string, unknown>) {
    super({ code: "CONFLICT", message, statusCode: 409, details });
  }
}
