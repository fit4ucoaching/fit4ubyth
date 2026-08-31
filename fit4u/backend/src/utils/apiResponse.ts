import type { Response } from "express";

/**
 * Enveloppe de réponse uniforme (Volume 3) :
 *   success / data
 *   success: false / error: { code, message, details, requestId }
 * Jamais de réponse construite à la main dans un contrôleur.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  meta: { total: number; page: number; pageSize: number },
): void {
  res.status(200).json({ success: true, data: { items, ...meta } });
}
