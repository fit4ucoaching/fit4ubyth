import type { Server, Socket } from "socket.io";

/** Canal `challenges` — mises à jour live d'un défi communautaire (score en direct). */
export function registerChallengesChannel(_io: Server, socket: Socket): void {
  socket.on("challenge:join", (payload: { challengeId: string }) => {
    void socket.join(`challenge:${payload.challengeId}`);
  });

  socket.on("challenge:progress", (payload: { challengeId: string; progress: number }) => {
    socket.to(`challenge:${payload.challengeId}`).emit("challenge:progress", {
      userId: socket.data.userId,
      progress: payload.progress,
    });
  });
}
