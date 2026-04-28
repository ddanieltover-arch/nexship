import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "@veloroute/db";
import { prisma } from "@veloroute/db";
import { AppError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/jwt.js";

export async function requireAuth(req: FastifyRequest, _reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "Missing bearer token", 401);
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError("UNAUTHORIZED", "User not found", 401);
    req.user = { id: user.id, email: user.email, role: user.role as Role };
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("UNAUTHORIZED", "Invalid or expired token", 401);
  }
}

export function requireRoles(...roles: Role[]) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    if (!req.user) throw new AppError("UNAUTHORIZED", "Not authenticated", 401);
    if (!roles.includes(req.user.role)) {
      throw new AppError("FORBIDDEN", "Insufficient permissions", 403);
    }
  };
}
