# Database Schema Reference

Full Prisma schema for the shipping platform. Adapt field names to the chosen brand.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────

enum Role {
  CUSTOMER
  STAFF
  ADMIN
}

enum ShipmentStatus {
  CREATED
  PICKED_UP
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED
  RETURNED
}

enum NotificationType {
  EMAIL
  SMS
  IN_APP
}

// ─── Models ──────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  phone         String?
  role          Role      @default(CUSTOMER)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  shipments     Shipment[]   @relation("CustomerShipments")
  assigned      Shipment[]   @relation("CourierShipments")
  addresses     Address[]
  notifications Notification[]
  sessions      Session[]

  @@index([email])
  @@index([role])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

model Address {
  id         String  @id @default(cuid())
  userId     String?
  street     String
  city       String
  state      String?
  country    String
  postalCode String
  lat        Float?
  lng        Float?
  label      String? // e.g. "Home", "Office"

  user             User?      @relation(fields: [userId], references: [id])
  originShipments  Shipment[] @relation("OriginAddress")
  destShipments    Shipment[] @relation("DestinationAddress")

  @@index([userId])
}

model Shipment {
  id            String         @id @default(cuid())
  trackingId    String         @unique @default(cuid())
  status        ShipmentStatus @default(CREATED)
  description   String?
  weightKg      Float?
  dimensionsCm  String?        // JSON string: { l, w, h }
  declaredValue Float?
  notes         String?
  estimatedAt   DateTime?
  deliveredAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  customerId    String
  courierId     String?
  originId      String
  destinationId String

  customer      User           @relation("CustomerShipments", fields: [customerId], references: [id])
  courier       User?          @relation("CourierShipments", fields: [courierId], references: [id])
  origin        Address        @relation("OriginAddress", fields: [originId], references: [id])
  destination   Address        @relation("DestinationAddress", fields: [destinationId], references: [id])
  events        TrackingEvent[]
  documents     Document[]
  notifications Notification[]

  @@index([trackingId])
  @@index([customerId])
  @@index([courierId])
  @@index([status])
  @@index([createdAt])
}

model TrackingEvent {
  id          String         @id @default(cuid())
  shipmentId  String
  status      ShipmentStatus
  description String?
  city        String?
  country     String?
  lat         Float?
  lng         Float?
  timestamp   DateTime       @default(now())

  shipment    Shipment       @relation(fields: [shipmentId], references: [id], onDelete: Cascade)

  @@index([shipmentId])
  @@index([timestamp])
}

model Document {
  id          String   @id @default(cuid())
  shipmentId  String
  name        String
  url         String
  mimeType    String
  uploadedAt  DateTime @default(now())

  shipment    Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
}

model Notification {
  id          String           @id @default(cuid())
  userId      String
  shipmentId  String?
  type        NotificationType
  subject     String?
  message     String
  read        Boolean          @default(false)
  sentAt      DateTime         @default(now())

  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  shipment    Shipment?        @relation(fields: [shipmentId], references: [id])

  @@index([userId])
  @@index([read])
}
```

## Key Design Decisions

- `trackingId` is separate from `id` — it's the human-readable public identifier
- `TrackingEvent` stores lat/lng for each stop — powers the map route
- `Address` stores lat/lng for geocoded locations (run geocoding on save)
- Soft deletes not included by default — add `deletedAt DateTime?` if needed
- `dimensionsCm` stored as JSON string for flexibility; use a separate `Dimension` model for stricter typing
