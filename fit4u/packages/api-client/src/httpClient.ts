import { ApiClientError } from "./ApiClientError";
import type { ApiClientConfig, RequestOptions } from "./types";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown>; requestId?: string };
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRIABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Client API centralisé (Volume 4) — seul point de contact réseau de toute
 * application front. Aucun `fetch` direct dans un composant/écran : tout
 * passe par l'instance retournée ici, injectée dans les hooks React Query
 * de chaque domaine (`services/use*.ts`).
 *
 * Responsabilités : injection du Bearer token, rotation automatique du
 * refresh token sur 401 (avec file d'attente pour éviter les rafales de
 * refresh concurrents), retry avec backoff exponentiel sur erreurs
 * réseau/5xx/429, timeout, propagation du `requestId` pour le support.
 */
export function createHttpClient(config: ApiClientConfig) {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;

  // File d'attente de refresh — évite que N requêtes en parallèle déclenchent
  // N appels /auth/refresh simultanés (le backend révoque à la rotation :
  // un second appel concurrent invaliderait le premier).
  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    refreshPromise ??= (async () => {
      try {
        const refreshToken = await config.tokenStorage.getRefreshToken();
        if (!refreshToken) return null;

        const res = await fetch(`${config.baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) return null;

        const json = (await res.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
        if (!json.success || !json.data) return null;

        await config.tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken);
        return json.data.accessToken;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  async function request<T>(
    path: string,
    init: RequestInit & { retryCount?: number } = {},
    options: RequestOptions = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const retryCount = init.retryCount ?? 0;

    const headers = new Headers(init.headers);
    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    if (!isFormData) {
      headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
    }

    if (!options.skipAuth) {
      const accessToken = await config.tokenStorage.getAccessToken();
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}${path}`, {
        ...init,
        headers,
        signal: options.signal ?? controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === "AbortError") throw ApiClientError.timeout();

      if (!options.skipRetry && retryCount < maxRetries) {
        await backoffDelay(retryCount);
        return request<T>(path, { ...init, retryCount: retryCount + 1 }, options);
      }
      throw ApiClientError.network();
    }
    clearTimeout(timeoutId);

    // 401 sur une requête authentifiée → tentative unique de refresh puis rejeu.
    if (response.status === 401 && !options.skipAuth && retryCount === 0) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return request<T>(path, { ...init, retryCount: retryCount + 1 }, options);
      }
      await config.tokenStorage.clearTokens();
      config.onSessionExpired?.();
      throw new ApiClientError({ code: "AUTHENTICATION_ERROR", message: "Session expirée.", statusCode: 401 });
    }

    if (!response.ok && RETRIABLE_STATUS.has(response.status) && !options.skipRetry && retryCount < maxRetries) {
      await backoffDelay(retryCount);
      return request<T>(path, { ...init, retryCount: retryCount + 1 }, options);
    }

    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (!response.ok || !json?.success) {
      throw new ApiClientError({
        code: json?.error?.code ?? "UNKNOWN_ERROR",
        message: json?.error?.message ?? "Une erreur inattendue est survenue.",
        statusCode: response.status,
        details: json?.error?.details,
        requestId: json?.error?.requestId ?? response.headers.get("x-request-id") ?? undefined,
      });
    }

    return json.data as T;
  }

  function backoffDelay(retryCount: number): Promise<void> {
    const delayMs = Math.min(300 * 2 ** retryCount, 2000);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, { method: "GET" }, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }, options),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }, options),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }, options),
    delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { method: "DELETE" }, options),
    /** Upload multipart — n'impose pas Content-Type (laisse le navigateur/RN fixer la boundary). */
    upload: <T>(path: string, formData: FormData, options?: RequestOptions) =>
      request<T>(path, { method: "POST", body: formData, headers: {} }, options),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
