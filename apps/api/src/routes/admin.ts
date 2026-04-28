import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma, ShipmentStatus, Role } from "@veloroute/db";
import { AppError } from "../lib/errors.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const listQuerySchema = z.object({
  status: z.nativeEnum(ShipmentStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const patchRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get(
    "/admin/shipments",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN, Role.STAFF)] },
    async (req, reply) => {
      const q = listQuerySchema.safeParse(req.query);
      if (!q.success) throw new AppError("VALIDATION_ERROR", "Invalid query", 400);
      const { status, page, limit } = q.data;
      const where = status ? { status } : {};
      const [items, total] = await Promise.all([
        prisma.shipment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            origin: true,
            destination: true,
            events: { orderBy: { timestamp: "asc" } },
            customer: { select: { id: true, email: true, name: true } },
            courier: { select: { id: true, email: true, name: true } },
          },
        }),
        prisma.shipment.count({ where }),
      ]);
      return reply.send({ items, total, page, limit });
    }
  );

  app.get(
    "/admin/users",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN)] },
    async (_req, reply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return reply.send({ users });
    }
  );

  app.patch(
    "/admin/users/:id/role",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN)] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const body = patchRoleSchema.safeParse(req.body);
      if (!body.success) throw new AppError("VALIDATION_ERROR", "Invalid body", 400);
      if (id === req.user!.id) throw new AppError("FORBIDDEN", "Cannot change own role", 403);
      const user = await prisma.user.update({
        where: { id },
        data: { role: body.data.role },
        select: { id: true, email: true, role: true },
      });
      return reply.send({ user });
    }
  );

  app.delete(
    "/admin/users/:id",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN)] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      if (id === req.user!.id) throw new AppError("FORBIDDEN", "Cannot delete self", 403);
      await prisma.user.delete({ where: { id } });
      return reply.status(204).send();
    }
  );

  app.get(
    "/admin/analytics/overview",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN, Role.STAFF)] },
    async (_req, reply) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const [activeShipments, deliveredToday, deliveredTotal, failedTotal, transitSum] =
        await Promise.all([
          prisma.shipment.count({
            where: { status: { notIn: ["DELIVERED", "FAILED", "RETURNED"] } },
          }),
          prisma.shipment.count({
            where: { status: "DELIVERED", deliveredAt: { gte: startOfDay } },
          }),
          prisma.shipment.count({ where: { status: "DELIVERED" } }),
          prisma.shipment.count({ where: { status: "FAILED" } }),
          prisma.shipment.findMany({
            where: { status: "DELIVERED", deliveredAt: { not: null } },
            select: { createdAt: true, deliveredAt: true },
            take: 500,
            orderBy: { deliveredAt: "desc" },
          }),
        ]);
      const finished = deliveredTotal + failedTotal;
      const deliveryRate = finished === 0 ? 0 : deliveredTotal / finished;
      let avgTransitHours = 0;
      if (transitSum.length) {
        const hours = transitSum
          .filter((s) => s.deliveredAt)
          .map((s) => (s.deliveredAt!.getTime() - s.createdAt.getTime()) / 3600000);
        avgTransitHours = hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
      }
      return reply.send({
        activeShipments,
        deliveredToday,
        deliveryRate,
        avgTransitHours: Math.round(avgTransitHours * 10) / 10,
        totalRevenue: 0,
      });
    }
  );

  app.get(
    "/admin/analytics/shipments",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN, Role.STAFF)] },
    async (_req, reply) => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const shipments = await prisma.shipment.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      });
      const byDay = new Map<string, number>();
      for (const s of shipments) {
        const d = s.createdAt.toISOString().slice(0, 10);
        byDay.set(d, (byDay.get(d) ?? 0) + 1);
      }
      const points = [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
      return reply.send({ points });
    }
  );

  app.get(
    "/admin/analytics/delivery-rate",
    { preHandler: [requireAuth, requireRoles(Role.ADMIN, Role.STAFF)] },
    async (_req, reply) => {
      const [delivered, failed] = await Promise.all([
        prisma.shipment.count({ where: { status: "DELIVERED" } }),
        prisma.shipment.count({ where: { status: "FAILED" } }),
      ]);
      const denom = delivered + failed;
      return reply.send({
        delivered,
        failed,
        rate: denom === 0 ? 0 : delivered / denom,
      });
    }
  );
}
