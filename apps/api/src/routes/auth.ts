import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@veloroute/db";
import { AppError } from "../lib/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { requireAuth } from "../middleware/auth.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const patchMeSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});

function sessionExpiry() {
  const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "7");
  return new Date(Date.now() + days * 86400_000);
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid body", 400, { issues: body.error.flatten() });
    }
    const existing = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (existing) throw new AppError("CONFLICT", "Email already registered", 409);

    const passwordHash = await hashPassword(body.data.password);
    const user = await prisma.user.create({
      data: {
        email: body.data.email,
        passwordHash,
        name: body.data.name,
        phone: body.data.phone,
      },
    });

    const refreshToken = signRefreshToken(user.id);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: sessionExpiry(),
      },
    });

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.status(201).send({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  });

  app.post("/auth/login", async (req, reply) => {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid body", 400, { issues: body.error.flatten() });
    }
    const user = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user?.passwordHash) {
      throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);
    }
    const ok = await verifyPassword(body.data.password, user.passwordHash);
    if (!ok) throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);

    const refreshToken = signRefreshToken(user.id);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: sessionExpiry(),
      },
    });

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.send({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  });

  app.post("/auth/refresh", async (req, reply) => {
    const body = refreshSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid body", 400);
    }
    let userId: string;
    try {
      userId = verifyRefreshToken(body.data.refreshToken).sub;
    } catch {
      throw new AppError("UNAUTHORIZED", "Invalid refresh token", 401);
    }

    const session = await prisma.session.findFirst({
      where: { refreshToken: body.data.refreshToken, userId },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new AppError("UNAUTHORIZED", "Session expired", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("UNAUTHORIZED", "User not found", 401);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.send({ accessToken, refreshToken: body.data.refreshToken });
  });

  app.post(
    "/auth/logout",
    { preHandler: requireAuth },
    async (req, reply) => {
      const body = refreshSchema.safeParse(req.body);
      if (body.success) {
        await prisma.session.deleteMany({
          where: { userId: req.user!.id, refreshToken: body.data.refreshToken },
        });
      } else {
        await prisma.session.deleteMany({ where: { userId: req.user!.id } });
      }
      return reply.send({ ok: true });
    }
  );

  app.get("/auth/me", { preHandler: requireAuth }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });
    return reply.send({ user });
  });

  app.patch("/auth/me", { preHandler: requireAuth }, async (req, reply) => {
    const body = patchMeSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid body", 400);
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(body.data.name !== undefined && { name: body.data.name }),
        ...(body.data.phone !== undefined && { phone: body.data.phone }),
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
    return reply.send({ user });
  });
}
