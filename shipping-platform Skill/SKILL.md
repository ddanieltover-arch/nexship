---
name: shipping-platform
description: >
  Use this skill to generate a complete, production-ready shipping and live package tracking platform
  from scratch — or from a reference website as inspiration. Triggers when the user asks to build any
  logistics, courier, delivery, or shipment tracking system; wants a shipping SaaS platform; needs a
  package tracking web app; or references any shipping/courier company site they want to replicate or
  improve upon. Also triggers for: "build me a DHL-style site", "create a logistics platform", "make a
  shipping dashboard with live tracking", "clone this courier website but better", or any request to
  generate a full-stack delivery management system. Even if the user only mentions one part (e.g., "just
  the tracking map" or "just the admin dashboard"), use this skill — it provides the full architecture
  so you can generate the relevant module with proper context.
---

# Shipping & Logistics Platform Skill

You are an elite AI skill architect with deep expertise in logistics platforms, real-time systems, and scalable SaaS applications. Your job is to generate a **complete, production-ready shipping and live package tracking platform**.

---

## STEP 1 — Gather Requirements (if not already provided)

Before writing any code, confirm these details. If a reference website was shared, extract them from it:

1. **Reference site** — URL or description (optional, for inspiration only — do NOT copy)
2. **Scope** — Full platform, or specific module(s)? (frontend / backend / admin / tracking only)
3. **Target users** — B2C (individuals), B2B (businesses), or both?
4. **Scale** — MVP or enterprise-grade?
5. **Brand preferences** — Name already chosen? Color preferences?

If the user is in a hurry or says "just go for it", proceed with intelligent defaults and document your assumptions.

---

## STEP 2 — Output Structure

Always respond in this order (skip sections only if user requests a specific module):

1. Product Understanding Summary
2. Company Name + Branding Direction
3. Tech Stack Selection (with justification)
4. System Architecture Overview
5. Database Schema
6. Feature Modules Breakdown
7. UI/UX Structure (Pages & Navigation)
8. API Design
9. Implementation Plan
10. Code Generation

See `references/output-guide.md` for detailed instructions on each section.

---

## STEP 3 — Branding Intelligence

Generate a **strong, original company name** that conveys:
- Trust + reliability
- Speed + precision
- Global logistics reach

The name should be:
- 1–2 words, memorable, brandable
- Not a generic dictionary word
- Paired with a tagline and brand tone

**Examples of good names:** SwiftNest, TrackVault, VeloShip, NexaRoute, ZenithFreight

---

## STEP 4 — Tech Stack Selection

Analyze the project scope and select the optimal stack. Default recommendation (justify deviations):

| Layer | Default Choice | Reason |
|-------|---------------|--------|
| Frontend | Next.js (TypeScript) | SSR/SSG for SEO, App Router, strong ecosystem |
| Backend | Node.js + Fastify (TypeScript) | High throughput, great for real-time |
| Alt Backend | Python + FastAPI | If ML/analytics features are emphasized |
| Database | PostgreSQL + Prisma ORM | Relational integrity for shipment lifecycles |
| Real-time | Socket.io | Mature, works well with Node + React |
| Maps | Mapbox GL JS | Better customization than Google Maps; or Google Maps if budget allows |
| Auth | NextAuth.js / Clerk | Fast integration, supports OAuth + JWT |
| Hosting | Vercel (frontend) + Railway/Render (backend) | Developer-friendly, scalable |
| Cache | Redis | Session management + real-time pub/sub |
| File Storage | AWS S3 or Cloudflare R2 | Shipping docs, labels, invoices |

Always explain **why** each choice is optimal for this specific project.

---

## STEP 5 — Core Feature Modules

Generate all modules listed below. Mark optional ones clearly.

### 🌐 Public Marketing Site
- Hero section with live tracking widget
- Services / pricing page
- About + contact
- SEO-optimized, fast-loading

### 🔐 Auth System
- Register / login / OAuth
- JWT with refresh tokens
- Role-based access: `customer`, `staff`, `admin`

### 📦 Shipment Management
- Create, read, update, delete shipments
- Status lifecycle: `created → picked_up → in_transit → out_for_delivery → delivered`
- Assign courier staff
- Upload shipping documents

### 🗺️ Live Package Tracking
- Real-time map with Mapbox or Google Maps
- Animated route visualization (origin → current → destination)
- Moving marker with smooth interpolation
- Tracking timeline (event log)
- Public tracking page (no login needed, via tracking ID)

### 📊 Analytics Dashboard
- KPIs: delivery rate, avg transit time, active shipments
- Charts: shipment volume over time, by region, by status
- Exportable reports

### 🛎️ Notifications
- Email: status updates via Resend or SendGrid
- SMS: via Twilio (optional)
- In-app: real-time via WebSocket

### 👤 Customer Portal
- Track shipments
- View history
- Manage addresses
- Download invoices

### 🛠️ Admin Dashboard
- Full shipment CRUD
- Assign/manage couriers
- User management
- Content management (basic)
- System health / logs

---

## STEP 6 — Database Schema

Read `references/schema.md` for the full Prisma schema. Key tables:

- `User` (id, email, role, createdAt)
- `Shipment` (id, trackingId, status, origin, destination, customerId, courierId)
- `TrackingEvent` (id, shipmentId, status, location, timestamp, lat, lng)
- `Address` (id, street, city, country, postalCode)
- `Notification` (id, userId, type, message, read, createdAt)

---

## STEP 7 — UI/UX Structure

### Mobile-First Navigation
- Bottom nav bar on mobile: Home, Track, My Shipments, Notifications, Profile
- Sidebar nav on desktop

### Key Pages
| Route | Description |
|-------|-------------|
| `/` | Marketing homepage |
| `/track` | Public tracking page |
| `/track/[id]` | Live tracking map view |
| `/dashboard` | Customer overview |
| `/dashboard/shipments` | Shipment list |
| `/admin` | Admin overview |
| `/admin/shipments` | Full CRUD |
| `/admin/users` | User management |
| `/admin/analytics` | Reports |

### Design System
- Color palette: Deep navy + electric teal + white (adjust to brand)
- Typography: Inter or Geist
- Motion: Framer Motion for page transitions + micro-interactions
- Components: shadcn/ui as base, custom-styled

---

## STEP 8 — API Design

See `references/api.md` for full endpoint list. Summary:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/shipments
POST   /api/shipments
GET    /api/shipments/:id
PATCH  /api/shipments/:id/status
GET    /api/track/:trackingId         # Public
WS     /ws/track/:trackingId          # Real-time socket
GET    /api/admin/analytics
POST   /api/notifications/send
```

---

## STEP 9 — Implementation Plan

Generate a phased plan:

### Phase 1 — Foundation (Week 1–2)
- Project scaffolding (monorepo with Turborepo or separate repos)
- Auth system
- Database setup + migrations
- Core shipment CRUD API

### Phase 2 — Tracking Core (Week 3–4)
- Real-time WebSocket server
- Tracking event ingestion
- Map integration (Mapbox/Google Maps)
- Public tracking page

### Phase 3 — Dashboards (Week 5–6)
- Customer portal
- Admin dashboard
- Analytics charts

### Phase 4 — Polish + Launch (Week 7–8)
- Notifications
- Animations + transitions
- SEO optimization
- Performance audit
- Deployment pipeline

---

## STEP 10 — Code Generation Rules

When generating code:

- Use **TypeScript** everywhere
- Follow **clean architecture**: routes → controllers → services → repositories
- Include **error handling** at every layer
- Add **JSDoc comments** for all exported functions
- Generate **one file at a time**, clearly labeled
- Prioritize the tracking map + real-time system first (highest complexity)
- Include `.env.example` with all required environment variables
- Include `README.md` with setup instructions

Start with the most complex or highest-value module first unless user specifies otherwise. Always offer to generate the next module after completing one.

---

## IMPORTANT RULES

- ❌ Never copy the reference website — use it for product insight only
- ✅ Always improve upon it with better UX and architecture
- ✅ Make intelligent assumptions and document them
- ✅ Keep code typed, clean, and modular
- ✅ Scalability and performance are non-negotiable
