import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@veloroute.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "adminadmin12";
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash: hash },
    create: {
      email,
      name: "Admin",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin:", email, "/", password);

  // Seed a customer for demo
  const customer = await prisma.user.upsert({
    where: { email: "customer@nexship.local" },
    update: {},
    create: {
      email: "customer@nexship.local",
      name: "Demo Customer",
      role: "CUSTOMER",
    },
  });

  // Create origin and destination
  const origin = await prisma.address.create({
    data: {
      street: "123 Port Ave",
      city: "Shanghai",
      country: "CN",
      postalCode: "200000",
      lat: 31.2304,
      lng: 121.4737,
    },
  });

  const destination = await prisma.address.create({
    data: {
      street: "456 Market St",
      city: "San Francisco",
      country: "US",
      postalCode: "94105",
      lat: 37.7749,
      lng: -122.4194,
    },
  });

  // Seed a demo shipment
  const trackingId = "NEX-123456789";
  const shipment = await prisma.shipment.upsert({
    where: { trackingId },
    update: {},
    create: {
      trackingId,
      status: "IN_TRANSIT",
      description: "Electronics Parts",
      weightKg: 15.5,
      customerId: customer.id,
      originId: origin.id,
      destinationId: destination.id,
      events: {
        create: [
          { status: "CREATED", city: "Shanghai", country: "CN", lat: 31.2304, lng: 121.4737, timestamp: new Date(Date.now() - 86400000 * 2) },
          { status: "PICKED_UP", city: "Shanghai", country: "CN", lat: 31.2304, lng: 121.4737, timestamp: new Date(Date.now() - 86400000) },
          { status: "IN_TRANSIT", city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503, timestamp: new Date(Date.now() - 43200000) },
        ],
      },
    },
  });

  console.log(`Seeded demo shipment with tracking ID: ${shipment.trackingId}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
