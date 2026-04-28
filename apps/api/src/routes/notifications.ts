import type { FastifyInstance } from "fastify";
import { prisma } from "@veloroute/db";
import { requireAuth } from "../middleware/auth.js";

export async function registerNotificationRoutes(app: FastifyInstance) {
  app.get("/notifications", { preHandler: [requireAuth] }, async (req, reply) => {
    const items = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { sentAt: "desc" },
      take: 100,
    });
    return reply.send({ items });
  });

  app.patch("/notifications/:id/read", { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const n = await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { read: true },
    });
    return reply.send({ updated: n.count });
  });

  app.patch("/notifications/read-all", { preHandler: [requireAuth] }, async (req, reply) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    return reply.send({ ok: true });
  });
}
