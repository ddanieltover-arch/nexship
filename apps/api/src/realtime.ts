import type { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function setSocketIo(server: IOServer) {
  io = server;
}

export function getSocketIo(): IOServer | null {
  return io;
}

export function emitToTracking(trackingId: string, event: string, data: unknown) {
  getSocketIo()?.to(`track:${trackingId}`).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: unknown) {
  getSocketIo()?.to(`user:${userId}`).emit(event, data);
}
