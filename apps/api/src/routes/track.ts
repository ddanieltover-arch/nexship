import type { FastifyInstance } from "fastify";
import { prisma } from "@veloroute/db";
import { AppError } from "../lib/errors.js";

export async function registerTrackRoutes(app: FastifyInstance) {
  app.get("/track/:trackingId", async (req, reply) => {
    const { trackingId } = req.params as { trackingId: string };
    const shipment = await prisma.shipment.findUnique({
      where: { trackingId },
      include: {
        origin: { select: { city: true, country: true, lat: true, lng: true } },
        destination: { select: { city: true, country: true, lat: true, lng: true } },
        events: {
          orderBy: { timestamp: "asc" },
          select: {
            status: true,
            description: true,
            city: true,
            country: true,
            lat: true,
            lng: true,
            timestamp: true,
          },
        },
      },
    });
    if (!shipment) throw new AppError("NOT_FOUND", "Tracking number not found", 404);

    return reply.send({
      trackingId: shipment.trackingId,
      status: shipment.status,
      estimatedAt: shipment.estimatedAt?.toISOString() ?? null,
      origin: {
        city: shipment.origin.city,
        country: shipment.origin.country,
        lat: shipment.origin.lat,
        lng: shipment.origin.lng,
      },
      destination: {
        city: shipment.destination.city,
        country: shipment.destination.country,
        lat: shipment.destination.lat,
        lng: shipment.destination.lng,
      },
      events: shipment.events.map((e) => ({
        status: e.status,
        description: e.description,
        city: e.city,
        country: e.country,
        lat: e.lat,
        lng: e.lng,
        timestamp: e.timestamp.toISOString(),
      })),
    });
  });
}
