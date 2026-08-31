import type { Server, Socket } from "socket.io";

/**
 * Canal `workout` — diffusion de la progression d'une séance en temps réel
 * (utile pour un écran "montre connectée" ou un spectateur de séance live
 * en communauté). L'écriture en base reste de la responsabilité de l'API
 * REST (`modules/workouts`) ; ce canal ne fait que diffuser l'état.
 */
export function registerWorkoutChannel(_io: Server, socket: Socket): void {
  socket.on("workout:progress", (payload: { workoutSessionId: string; exerciseIndex: number; setsCompleted: number }) => {
    socket.to(`workout:${payload.workoutSessionId}`).emit("workout:progress", payload);
  });

  socket.on("workout:join", (payload: { workoutSessionId: string }) => {
    void socket.join(`workout:${payload.workoutSessionId}`);
  });

  socket.on("workout:leave", (payload: { workoutSessionId: string }) => {
    void socket.leave(`workout:${payload.workoutSessionId}`);
  });
}
