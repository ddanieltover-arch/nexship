import { buildApp } from "./app.js";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { setSocketIo } from "./realtime.js";

const PORT = Number(process.env.PORT ?? 3001);

async function main() {
  const app = await buildApp();
  await app.ready();

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
    if (!trackingId) {
      socket.disconnect(true);
      return;
    }
    const room = `track:${trackingId}`;
    void socket.join(room);
    socket.emit("subscribed", { trackingId });
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`API listening on ${PORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
