# Output Guide — Detailed Instructions Per Section

## 1. Product Understanding Summary

Write 3–5 sentences summarizing:
- What the platform does
- Who the core users are
- What differentiates this from generic shipping sites
- Key challenges the architecture must solve (real-time, scale, UX)

## 2. Company Name + Branding Direction

Provide:
- **Primary name** (explain reasoning)
- 2 **alternative names**
- **Tagline** (under 10 words)
- **Brand tone**: e.g., "Tech-forward, trustworthy, premium but approachable"
- **Color direction**: e.g., "Deep navy (#0F172A) + electric teal (#06B6D4) + off-white (#F8FAFC)"
- **Logo concept** (describe in words): e.g., "Stylized arrow forming a shield — speed + security"

## 3. Tech Stack (with justification)

For each layer, write:
- What you chose
- Why (1–2 sentences)
- Any tradeoffs acknowledged

Format as a table + bullet explanations below.

## 4. System Architecture Overview

Include a **text-based architecture diagram** like:

```
[Client: Next.js]
      |
   [API Gateway / Nginx]
      |
  [Fastify API Server]
   /        |        \
[Auth]  [Shipments]  [WebSocket Server]
  |          |              |
[PostgreSQL] [PostgreSQL]  [Redis Pub/Sub]
                               |
                         [Tracking Events]
```

Describe each layer in 1–2 sentences.

## 5. Database Schema

Provide the full **Prisma schema** (`schema.prisma`), including:
- All models with field types
- Relations between models
- Indexes on frequently queried fields
- Enums for status values

## 6. Feature Modules

For each module:
- Name + description
- User roles that interact with it
- Key UI components
- Key API endpoints it depends on
- Complexity estimate: Low / Medium / High

## 7. UI/UX Structure

For each page:
- Route
- Purpose
- Key components / sections
- Mobile vs desktop layout differences

Include a navigation map showing how pages connect.

## 8. API Design

For each endpoint:
- Method + path
- Auth required? (role)
- Request body schema
- Response schema
- Error cases

## 9. Implementation Plan

Phased plan with:
- Phase name + duration
- Tasks (bullet list)
- Deliverable at end of phase
- Dependencies between phases

## 10. Code Generation

When generating code files, always:
1. State the filename and path at the top: `// src/services/shipment.service.ts`
2. Include all imports
3. Export all public functions/classes
4. Handle errors with proper HTTP status codes
5. Add TODO comments where integration keys are needed (maps, SMS, etc.)

**File generation order (recommended):**
1. `schema.prisma` — database first
2. `.env.example` — document all env vars
3. Auth module (register, login, JWT middleware)
4. Shipment CRUD (routes, controller, service)
5. Tracking WebSocket server
6. Map frontend component
7. Admin dashboard pages
8. Customer portal pages
9. Notification service
10. Analytics queries + charts
