import type { Server, Socket } from "socket.io";

/**
 * Canal `notifications` — purement passif côté client (le serveur émet via
 * `jobs/notification.job.ts` sur la room `user:{userId}`, déjà rejointe à la
 * connexion). Ce fichier existe pour la symétrie avec les autres canaux et
 * comme point d'extension (ex. accusé de lecture `notification:ack`).
 */
export function registerNotificationsChannel(_io: Server, socket: Socket): void {
  socket.on("notification:ack", (payload: { notificationId: string }) => {
    socket.emit("notification:ack:received", payload);
  });
}
