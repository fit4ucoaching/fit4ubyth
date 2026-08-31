import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
  userId?: string;
}

/**
 * Contexte de requête accessible sans "prop drilling" (ex. depuis un
 * repository profondément imbriqué pour enrichir un log) — utilisé
 * uniquement pour l'observabilité (logs), jamais pour transporter des
 * décisions métier (qui restent des paramètres explicites de fonction).
 */
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}
