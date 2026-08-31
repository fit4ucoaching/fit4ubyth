/**
 * Erreur applicative de base. Toutes les erreurs métier levées dans les
 * services héritent de cette classe — jamais de `throw new Error(...)` brut
 * dans le code applicatif (réservé aux bugs inattendus, capturés par
 * `error.middleware.ts` comme erreurs 500 génériques).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(params: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = this.constructor.name;
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
