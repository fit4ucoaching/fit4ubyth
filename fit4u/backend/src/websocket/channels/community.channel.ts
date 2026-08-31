import type { Server, Socket } from "socket.io";

/** Canal `community` — nouveaux posts/commentaires/likes en direct dans un flux ou groupe. */
export function registerCommunityChannel(_io: Server, socket: Socket): void {
  socket.on("community:join-group", (payload: { groupId: string }) => {
    void socket.join(`group:${payload.groupId}`);
  });

  socket.on("community:leave-group", (payload: { groupId: string }) => {
    void socket.leave(`group:${payload.groupId}`);
  });
}
