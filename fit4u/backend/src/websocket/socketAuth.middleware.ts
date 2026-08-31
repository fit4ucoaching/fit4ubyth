import type { Socket } from "socket.io";

import { verifyAccessToken } from "../utils/jwt";

/** Authentifie chaque connexion Socket.IO via le même JWT access token que l'API REST. */
export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    next(new Error("Authentification requise"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    socket.data.userId = payload.sub;
    socket.data.roles = payload.roles;
    next();
  } catch {
    next(new Error("Token invalide ou expiré"));
  }
}
