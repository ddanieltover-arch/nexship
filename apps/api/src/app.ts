import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { existsSync } from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import { AppError, errorReply } from "./lib/errors.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerShipmentRoutes } from "./routes/shipments.js";
import { registerTrackRoutes } from "./routes/track.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerChatRoutes } from "./routes/chat.js";
import { registerContactRoutes } from "./routes/contact.js";
import { registerSupportRoutes } from "./routes/support.js";
import { registerUploadRoutes } from "./routes/upload.js";

export type BuildAppOptions = {
  /** Omit GET `/` JSON landing so Next.js (or another host) can serve the site root in a merged server. */
  integrated?: boolean;
};

export async function buildApp(options?: BuildAppOptions) {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Register Multipart for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  // Serve uploads statically only when the directory exists.
  // In serverless environments (e.g. Vercel), this folder may not be present.
  const uploadsRoot = path.join(process.cwd(), "uploads");
  if (existsSync(uploadsRoot)) {
    await app.register(fastifyStatic, {
      root: uploadsRoot,
      prefix: "/api/v1/uploads/",
      decorateReply: false,
    });
  } else {
    app.log.warn({ uploadsRoot }, "Uploads directory not found; skipping static uploads plugin");
  }

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
      await v1.register(registerContactRoutes);
      await v1.register(registerSupportRoutes);
      await v1.register(registerUploadRoutes);
    },
    { prefix: "/api/v1" }
  );

  if (!options?.integrated) {
    app.get("/", async () => ({
      name: "Nexships Logistics API",
      version: "1.0.0",
      status: "online",
      message: "The API is active. Please visit https://nexships.com to access the Nexships Global Platform.",
    }));
  }

  app.get("/health", async () => ({ ok: true }));

  return app;
}

let cachedAppPromise: ReturnType<typeof buildApp> | null = null;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedAppPromise) {
    cachedAppPromise = buildApp();
  }
  void cachedAppPromise
    .then((app) =>
      Promise.resolve(app.ready()).then(() => {
        app.server.emit("request", req, res);
      })
    )
    .catch((err: unknown) => {
      console.error("Fastify ready error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
}
