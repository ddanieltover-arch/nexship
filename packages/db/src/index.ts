import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export enum Role {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
}

export enum ShipmentStatus {
  CREATED = "CREATED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  RETURNED = "RETURNED",
}

export enum NotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP = "IN_APP",
}

export * from "@prisma/client";
