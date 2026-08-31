/**
 * Adaptateur de stockage des tokens — chaque app injecte sa propre
 * implémentation (Expo SecureStore pour mobile, cookie httpOnly ou
 * localStorage pour web/admin). Le client HTTP reste agnostique de la
 * plateforme (principe d'inversion de dépendance, cohérent avec
 * `packages/teddy-sdk`).
 */
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

export interface ApiClientConfig {
  baseUrl: string;
  tokenStorage: TokenStorage;
  /** Appelé quand le refresh échoue (session définitivement expirée) — l'app redirige vers /login. */
  onSessionExpired?: () => void;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface RequestOptions {
  /** Ignore l'ajout automatique du Bearer token (ex. login/register). */
  skipAuth?: boolean;
  /** Désactive le retry automatique (ex. requêtes non idempotentes comme un paiement). */
  skipRetry?: boolean;
  signal?: AbortSignal;
}
