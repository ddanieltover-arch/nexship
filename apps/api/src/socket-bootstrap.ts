import type { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { setSocketIo } from "./realtime.js";

const DEBUG_ENDPOINT = "http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c";

function debugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  // #region agent log
  void fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "2d0882" },
    body: JSON.stringify({ sessionId: "2d0882", runId: "run5", hypothesisId, location, message, data, timestamp: Date.now() }),
  }).catch(() => {});
  // #endregion
}

/** Attach Socket.io to the Fastify HTTP server (shared by standalone API and merged server). */
export function attachSocketIo(app: FastifyInstance) {
  const io = new Server(app.server, {
    path: "/ws/socket.io",
    cors: { origin: "*" },
  });

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    app.log.info("Socket.io using Redis adapter");
  }

  setSocketIo(io);

  io.on("connection", (socket) => {
    const trackingId = socket.handshake.query.trackingId as string | undefined;
    const userId = socket.handshake.query.userId as string | undefined;
    debugLog("H1", "api/socket-bootstrap.ts:connection", "Socket connected", {
      socketId: socket.id,
      hasTrackingId: Boolean(trackingId),
      hasUserId: Boolean(userId),
    });

    if (trackingId) {
      const room = `track:${trackingId}`;
      void socket.join(room);
      debugLog("H1", "api/socket-bootstrap.ts:trackingJoin", "Tracking room join attempted", { room, socketId: socket.id });
      socket.emit("subscribed", { trackingId });
    }

    if (userId) {
      const room = `user:${userId}`;
      void socket.join(room);
      debugLog("H2", "api/socket-bootstrap.ts:userJoin", "User room join attempted", { room, socketId: socket.id });
      socket.emit("user_subscribed", { userId });
    }
  });

  return io;
}
