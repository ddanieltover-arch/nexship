import type { Role } from "@veloroute/db";

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string; email: string; role: Role };
  }
}
