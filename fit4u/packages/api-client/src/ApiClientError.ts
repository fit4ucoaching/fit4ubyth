/**
 * Erreur cliente — miroir exact du format d'erreur uniforme du backend
 * (Volume 3 : `{ success:false, error:{ code, message, details, requestId } }`).
 * Chaque écran peut afficher `error.message` directement (déjà traduit côté
 * backend pour l'utilisateur final) ou brancher sur `error.code` pour un
 * comportement spécifique (ex. `AUTHENTICATION_ERROR` → redirection login).
 */
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly requestId?: string;

  constructor(params: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
    requestId?: string;
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
    this.requestId = params.requestId;
  }

  static network(message = "Connexion impossible. Vérifiez votre réseau."): ApiClientError {
    return new ApiClientError({ code: "NETWORK_ERROR", message, statusCode: 0 });
  }

  static timeout(message = "La requête a expiré, réessayez."): ApiClientError {
    return new ApiClientError({ code: "TIMEOUT", message, statusCode: 0 });
  }
}
