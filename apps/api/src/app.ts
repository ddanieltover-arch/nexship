import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { AppError, errorReply } from "./lib/errors.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerShipmentRoutes } from "./routes/shipments.js";
import { registerTrackRoutes } from "./routes/track.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerChatRoutes } from "./routes/chat.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) {
      const r = errorReply(err);
      return reply.status(r.statusCode).send(r.body);
    }
    app.log.error(err);
    const r = errorReply(err);
    return reply.status(r.statusCode).send(r.body);
  });

  await app.register(
    async (v1) => {
      await v1.register(rateLimit, {
        max: 120,
        timeWindow: "1 minute",
        prefix: "rl-track-",
      });
      await v1.register(registerTrackRoutes);
    },
    { prefix: "/api/v1" }
  );

  await app.register(
    async (v1) => {
      await v1.register(registerAuthRoutes);
      await v1.register(registerShipmentRoutes);
      await v1.register(registerAdminRoutes);
      await v1.register(registerNotificationRoutes);
      await v1.register(registerChatRoutes);
    },
    { prefix: "/api/v1" }
  );

  app.get("/", async () => ({ 
    name: "Nexships Logistics API", 
    version: "1.0.0",
    status: "online",
    message: "The API is active. Please visit http://localhost:3000 to access the Nexships Global Platform." 
  }));

  app.get("/health", async () => ({ ok: true }));

  return app;
}
