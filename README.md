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

4. Start the stack (pick one):

   **Split processes (default):**

   ```bash
   npm run dev
   ```

   - Web: [http://localhost:3010](http://localhost:3010) (see `apps/web/package.json`)
   - API: [http://localhost:3001](http://localhost:3001) — health: `GET /health`
   - REST base: `http://localhost:3001/api/v1`
   - Socket.io path: `/ws/socket.io` (connect with query `trackingId=<id>`)

   **Single process (Next.js + Fastify + Socket.io on one `PORT`):**

   ```bash
   npm run dev:merged
   ```

   Uses `@veloroute/server`: same Node HTTP server for UI, `/api/v1`, `/health`, and WebSockets. Set `PORT` (and optional `HOST`) in `.env`; avoid running `npm run dev` at the same time on the same port. If `NEXT_PUBLIC_API_URL` is unset, the browser calls same-origin `/api/v1`. For production:

   ```bash
   npm run build:merged
   npm run start:merged
   ```

## Default accounts

After seeding, sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (see `.env.example`). Register customers from `/register`.

## Email

All transactional mail (shipment created, status updates, quote requests, contact form) goes through **Resend** from `apps/web` (`/api/send-email` → `email-server.ts`).

Set on the **web** host (Vercel / local `.env`):

- `RESEND_API_KEY` — required to send
- `RESEND_FROM` — verified sender, e.g. `Nexship Logistics <support@nexships.com>`
- `ADMIN_EMAIL` — inbox for admin/CC notification copies (default `support@nexships.com`)

Without `RESEND_API_KEY`, sending is skipped (in-app notifications still apply).

## Deploy (Vercel web + API elsewhere)

The **Next.js UI** (`apps/web`) is what you deploy to **Vercel**. The **Fastify API** (`apps/api`) and **Socket.io** need a **long‑running Node host** (Railway, Render, Fly.io, a VPS, Docker). The merged **single-process** app (`apps/server`, `npm run start:merged`) is aimed at that kind of host—not Vercel’s serverless model.

### Vercel (frontend only)

1. Import the Git repo in Vercel.
2. **Root Directory:** `apps/web`  
   Enable **“Include source files outside the root Directory”** (or equivalent) so the monorepo lockfile and workspaces resolve.
3. **Install Command** (if not using `apps/web/vercel.json`):  
   `cd ../.. && npm ci`
4. **Build Command** (if not using `apps/web/vercel.json`):  
   `cd ../.. && npx turbo run build --filter=@veloroute/web`
5. **Environment variables** (Production / Preview as needed):

   | Variable | Purpose |
   |----------|---------|
   | `NEXT_PUBLIC_API_URL` | Public REST base, e.g. `https://api.yourdomain.com/api/v1` |
   | `NEXT_PUBLIC_WS_URL` | Socket.io origin (no path), e.g. `https://api.yourdomain.com` |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | Optional; map features |
   | `RESEND_API_KEY` | Resend API key for transactional emails |
   | `RESEND_FROM` | Verified From address, e.g. `Nexship Logistics <support@nexships.com>` |
   | `INTERNAL_API_URL` | Optional; absolute API base for server-side `fetch` if you do not rely on public URL alone |
   | `API_REWRITE_BASE_URL` | Optional; same as API base if you proxy same-origin `/api/v1` via Next rewrites without setting `NEXT_PUBLIC_API_URL` |

   Use **https** and your real API hostname. For local merged testing, **do not** point these at production.

6. **Node:** `.nvmrc` pins **20**; Vercel picks it up automatically.

`apps/web/vercel.json` already sets install/build commands for the monorepo. If the build fails, confirm `package-lock.json` is committed and run `npm ci` locally from the repo root.

### API + realtime (separate service)

Deploy `apps/api` (or the Docker/merged image you prefer) with at least:

- `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `PORT` (host-provided)
- Optional: `REDIS_URL`

Allow **CORS** from your Vercel domain (Fastify currently uses permissive CORS; tighten for production). Socket clients use `NEXT_PUBLIC_WS_URL` and path `/ws/socket.io`.

### Optional: API on Vercel Serverless

`apps/api` includes a legacy `vercel.json` for a **serverless-style** API surface; long-lived WebSockets and heavy Fastify usage are still better on a dedicated Node host. Prefer Railway/Render for the full API unless you know you only need HTTP routes that fit serverless limits.

## Project layout

| Path | Role |
|------|------|
| `apps/web` | Next.js App Router UI |
| `apps/api` | Fastify + Socket.io |
| `apps/server` | Optional merged server (Next + API + Socket.io, one port) |
| `packages/db` | Prisma schema, migrations, client export |

The `shipping-platform Skill/` folder is reference documentation only and is not part of the build.
