import type { Server, Socket } from "socket.io";

/**
 * Canal `analytics` — réservé au BackOffice/ERP (dashboard temps réel) :
 * rejoindre la room `admin:analytics` nécessite un rôle admin, vérifié à la
 * connexion (`socketAuth.middleware.ts` expose `socket.data.roles`).
 */
export function registerAnalyticsChannel(_io: Server, socket: Socket): void {
  socket.on("analytics:subscribe", () => {
    const roles = (socket.data.roles as string[] | undefined) ?? [];
    if (roles.includes("ADMIN") || roles.includes("SUPER_ADMIN")) {
      void socket.join("admin:analytics");
    }
  });
}
