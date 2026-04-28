import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { NotificationType, prisma, ShipmentStatus, type Role, Prisma } from "@veloroute/db";
import { AppError } from "../lib/errors.js";
import { approximateCoords } from "../lib/geocode.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { emitToTracking } from "../realtime.js";
import { sendStatusEmail } from "../services/email.js";

const addressInput = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postalCode: z.string(),
  label: z.string().optional(),
});

const createShipmentSchema = z.object({
  description: z.string().optional(),
  weightKg: z.number().optional(),
  dimensionsCm: z.string().optional(),
  declaredValue: z.number().optional(),
  notes: z.string().optional(),
  estimatedAt: z.string().datetime().optional(),
  origin: addressInput,
  destination: addressInput,
});

const listQuerySchema = z.object({
  status: z.nativeEnum(ShipmentStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const patchShipmentSchema = z.object({
  description: z.string().optional(),
  weightKg: z.number().optional(),
  courierId: z.string().nullable().optional(),
  notes: z.string().optional(),
  estimatedAt: z.string().datetime().nullable().optional(),
});

const patchStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  description: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  timestamp: z.string().datetime().optional(),
});

const documentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  mimeType: z.string(),
});

async function ensureShipmentAccess(shipmentId: string, userId: string, role: Role) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { customer: true, courier: true, origin: true },
  });
  if (!shipment) throw new AppError("NOT_FOUND", "Shipment not found", 404);
  if (role === "ADMIN" || role === "STAFF") return shipment;
  if (shipment.customerId === userId || shipment.courierId === userId) return shipment;
  throw new AppError("FORBIDDEN", "Cannot access this shipment", 403);
}

export async function registerShipmentRoutes(app: FastifyInstance) {
  app.get(
    "/shipments",
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const q = listQuerySchema.safeParse(req.query);
      if (!q.success) throw new AppError("VALIDATION_ERROR", "Invalid query", 400);

      const { status, page, limit, search, from, to } = q.data;
      const and: Prisma.ShipmentWhereInput[] = [];

      if (req.user!.role === "CUSTOMER") {
        and.push({ customerId: req.user!.id });
      }

      if (status) and.push({ status });
      if (search) {
        and.push({
          OR: [
            { trackingId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        });
      }
      if (from || to) {
        and.push({
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        });
      }

      const where: Prisma.ShipmentWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await Promise.all([
        prisma.shipment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            origin: true,
            destination: true,
            customer: { select: { id: true, email: true, name: true } },
            courier: { select: { id: true, email: true, name: true } },
          },
        }),
        prisma.shipment.count({ where }),
      ]);

      return reply.send({ items, total, page, limit });
    }
  );

  app.post(
    "/shipments",
    { preHandler: [requireAuth, requireRoles("STAFF", "ADMIN")] },
    async (req, reply) => {
      const body = z.object({
        description: z.string().optional(),
        weightKg: z.number().optional(),
        shipmentType: z.string().optional(),
        carrier: z.string().optional(),
        paymentMethod: z.string().optional(),
        senderName: z.string().optional(),
        senderPhone: z.string().optional(),
        senderEmail: z.string().optional(),
        receiverName: z.string().optional(),
        receiverPhone: z.string().optional(),
        receiverEmail: z.string().optional(),
        departureAt: z.string().datetime().optional(),
        estimatedAt: z.string().datetime().optional(),
        origin: addressInput,
        destination: addressInput,
      }).safeParse(req.body);

      if (!body.success) {
        throw new AppError("VALIDATION_ERROR", "Invalid body", 400, { issues: body.error.flatten() });
      }

      const o = body.data.origin;
      const d = body.data.destination;
      const oCoords = approximateCoords(o.city, o.country);
      const dCoords = approximateCoords(d.city, d.country);

      const shipment = await prisma.$transaction(async (tx) => {
        const origin = await tx.address.create({
          data: {
            street: o.street,
            city: o.city,
            state: o.state,
            country: o.country,
            postalCode: o.postalCode,
            label: "Origin",
            lat: oCoords.lat,
            lng: oCoords.lng,
          },
        });
        const destination = await tx.address.create({
          data: {
            street: d.street,
            city: d.city,
            state: d.state,
            country: d.country,
            postalCode: d.postalCode,
            label: "Destination",
            lat: dCoords.lat,
            lng: dCoords.lng,
          },
        });

        const created = await tx.shipment.create({
          data: {
            customerId: req.user!.id, // Admin creates it, but we might want a real customer ID later
            description: body.data.description,
            weightKg: body.data.weightKg,
            shipmentType: body.data.shipmentType,
            carrier: body.data.carrier,
            paymentMethod: body.data.paymentMethod,
            senderName: body.data.senderName,
            senderPhone: body.data.senderPhone,
            senderEmail: body.data.senderEmail,
            receiverName: body.data.receiverName,
            receiverPhone: body.data.receiverPhone,
            receiverEmail: body.data.receiverEmail,
            departureAt: body.data.departureAt ? new Date(body.data.departureAt) : undefined,
            estimatedAt: body.data.estimatedAt ? new Date(body.data.estimatedAt) : undefined,
            originId: origin.id,
            destinationId: destination.id,
            status: "CREATED",
          },
          include: { origin: true, destination: true },
        });

        await tx.trackingEvent.create({
          data: {
            shipmentId: created.id,
            status: "CREATED",
            description: "Shipment created and scheduled",
            city: origin.city,
            country: origin.country,
            lat: origin.lat,
            lng: origin.lng,
          },
        });

        return created;
      });

      return reply.status(201).send({ shipment });
    }
  );

  app.get(
    "/shipments/:id",
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await ensureShipmentAccess(id, req.user!.id, req.user!.role);
      const shipment = await prisma.shipment.findUnique({
        where: { id },
        include: {
          origin: true,
          destination: true,
          customer: { select: { id: true, email: true, name: true } },
          courier: { select: { id: true, email: true, name: true } },
          events: { orderBy: { timestamp: "asc" } },
          documents: true,
        },
      });
      return reply.send({ shipment });
    }
  );

  app.patch(
    "/shipments/:id",
    { preHandler: [requireAuth, requireRoles("STAFF", "ADMIN")] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await ensureShipmentAccess(id, req.user!.id, req.user!.role);
      const body = patchShipmentSchema.safeParse(req.body);
      if (!body.success) throw new AppError("VALIDATION_ERROR", "Invalid body", 400);

      const shipment = await prisma.shipment.update({
        where: { id },
        data: {
          ...(body.data.description !== undefined && { description: body.data.description }),
          ...(body.data.weightKg !== undefined && { weightKg: body.data.weightKg }),
          ...(body.data.notes !== undefined && { notes: body.data.notes }),
          ...(body.data.estimatedAt !== undefined && {
            estimatedAt: body.data.estimatedAt ? new Date(body.data.estimatedAt) : null,
          }),
          ...(body.data.courierId !== undefined && { courierId: body.data.courierId }),
        },
        include: { origin: true, destination: true },
      });
      return reply.send({ shipment });
    }
  );

  app.delete(
    "/shipments/:id",
    { preHandler: [requireAuth, requireRoles("ADMIN")] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const s = await prisma.shipment.findUnique({ where: { id } });
      if (!s) throw new AppError("NOT_FOUND", "Shipment not found", 404);
      await prisma.shipment.delete({ where: { id } });
      return reply.status(204).send();
    }
  );

  app.patch(
    "/shipments/:id/status",
    { preHandler: [requireAuth, requireRoles("STAFF", "ADMIN")] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await ensureShipmentAccess(id, req.user!.id, req.user!.role);
      const body = patchStatusSchema.safeParse(req.body);
      if (!body.success) throw new AppError("VALIDATION_ERROR", "Invalid body", 400);

      const prev = await prisma.shipment.findUnique({
        where: { id },
        include: { customer: true, origin: true, destination: true },
      });
      if (!prev) throw new AppError("NOT_FOUND", "Shipment not found", 404);

      const fallback = approximateCoords(prev.origin.city, prev.origin.country);
      const lat = body.data.lat ?? prev.destination.lat ?? fallback.lat;
      const lng = body.data.lng ?? prev.destination.lng ?? fallback.lng;

      const [shipment, event] = await prisma.$transaction([
        prisma.shipment.update({
          where: { id },
          data: {
            status: body.data.status,
            ...(body.data.status === "DELIVERED" && { 
              deliveredAt: body.data.timestamp ? new Date(body.data.timestamp) : new Date() 
            }),
          },
          include: { origin: true, destination: true, customer: true },
        }),
        prisma.trackingEvent.create({
          data: {
            shipmentId: id,
            status: body.data.status,
            description: body.data.description ?? `Status updated to ${body.data.status}`,
            city: body.data.city,
            country: body.data.country,
            lat,
            lng,
            timestamp: body.data.timestamp ? new Date(body.data.timestamp) : undefined,
          },
        }),
      ]);

      await prisma.notification.create({
        data: {
          userId: prev.customerId,
          shipmentId: id,
          type: NotificationType.IN_APP,
          subject: "Shipment update",
          message: `Your shipment ${prev.trackingId} is now ${body.data.status.replace(/_/g, " ")}`,
        },
      });

      emitToTracking(prev.trackingId, "status_change", {
        status: body.data.status,
        description: event.description,
      });
      emitToTracking(prev.trackingId, "location_update", {
        lat,
        lng,
        status: body.data.status,
        timestamp: event.timestamp.toISOString(),
      });
      if (body.data.status === "DELIVERED") {
        emitToTracking(prev.trackingId, "delivered", { timestamp: new Date().toISOString() });
      }

      void sendStatusEmail(prev.customer.email, prev.trackingId, body.data.status);

      return reply.send({ shipment, event });
    }
  );

  app.post(
    "/shipments/:id/documents",
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const shipment = await ensureShipmentAccess(id, req.user!.id, req.user!.role);
      const body = documentSchema.safeParse(req.body);
      if (!body.success) throw new AppError("VALIDATION_ERROR", "Invalid body", 400);
      if (req.user!.role === "CUSTOMER" && shipment.customerId !== req.user!.id) {
        throw new AppError("FORBIDDEN", "Cannot add document", 403);
      }
      const doc = await prisma.document.create({
        data: {
          shipmentId: id,
          name: body.data.name,
          url: body.data.url,
          mimeType: body.data.mimeType,
        },
      });
      return reply.status(201).send({ document: doc });
    }
  );

  app.get(
    "/shipments/:id/events",
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await ensureShipmentAccess(id, req.user!.id, req.user!.role);
      const events = await prisma.trackingEvent.findMany({
        where: { shipmentId: id },
        orderBy: { timestamp: "asc" },
      });
      return reply.send({ events });
    }
  );
}
