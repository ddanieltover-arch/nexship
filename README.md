# Nexship — shipping platform

Monorepo for a logistics demo: **Next.js** marketing and dashboards, **Fastify** REST + **Socket.io** live tracking, **PostgreSQL** via **Prisma**, optional **Redis** for Socket.io adapter, **Mapbox** on the public track page, and **Resend** for status emails.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or hosted)
- Optional: Redis, Mapbox token, Resend API key

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL` and JWT secrets in `.env`. For the web app, either place the same `NEXT_PUBLIC_*` values in `apps/web/.env.local` or export them in your shell.

2. Install dependencies (from repo root):

   ```bash
   npm install
   ```

3. Apply database schema and seed an admin user:

   ```bash
   npm run db:migrate
   npm run db:generate
   npm run db:seed
   ```

   `db:migrate` runs `prisma migrate dev` in `@veloroute/db`. For production, use `prisma migrate deploy`.

4. Start API and web together:

   ```bash
   npm run dev
   ```

   - Web: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:3001](http://localhost:3001) — health: `GET /health`
   - REST base: `http://localhost:3001/api/v1`
   - Socket.io path: `/ws/socket.io` (connect with query `trackingId=<id>`)

## Default accounts

After seeding, sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (see `.env.example`). Register customers from `/register`.

## Email

When `RESEND_API_KEY` is set, status changes trigger a simple shipment email via the Resend HTTP API. Without it, email sending is skipped (in-app notifications still apply).

## Deploy notes

- Run **web** on Vercel (or similar) with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` pointing at your public API host.
- Run **API** on Railway, Render, or a VM with `DATABASE_URL`, JWT secrets, and optional `REDIS_URL`.
- Ensure the API host allows CORS from your web origin (Fastify CORS is set to `origin: true` for development flexibility; tighten for production).

## Project layout

| Path | Role |
|------|------|
| `apps/web` | Next.js App Router UI |
| `apps/api` | Fastify + Socket.io |
| `packages/db` | Prisma schema, migrations, client export |

The `shipping-platform Skill/` folder is reference documentation only and is not part of the build.
