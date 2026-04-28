import type { FastifyReply, FastifyRequest } from "fastify";
import { Role, prisma } from "@veloroute/db";
import { AppError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/jwt.js";

function debugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  // #region agent log
  void fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run3',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

export async function requireAuth(req: FastifyRequest, _reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    debugLog("H1", "api/middleware/auth.ts:missingBearer", "Authorization header missing or malformed", {
      hasHeader: Boolean(header),
      prefix: header?.slice(0, 12) ?? null,
      url: req.url,
      method: req.method,
    });
    throw new AppError("UNAUTHORIZED", "Missing bearer token", 401);
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError("UNAUTHORIZED", "User not found", 401);
    debugLog("H2", "api/middleware/auth.ts:verified", "Access token verified", {
      sub: payload.sub,
      role: payload.role,
      url: req.url,
      method: req.method,
    });
    req.user = { id: user.id, email: user.email, role: user.role as Role };
  } catch (e) {
    debugLog("H3", "api/middleware/auth.ts:verifyFailed", "Access token verification failed", {
      errorName: e instanceof Error ? e.name : "unknown",
      errorMessage: e instanceof Error ? e.message : "unknown",
      url: req.url,
      method: req.method,
    });
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
