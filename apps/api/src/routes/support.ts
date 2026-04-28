import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma, Role } from "@veloroute/db";
import { emitToUser } from "../realtime.js";

const publicMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  content: z.string().min(1),
});

export async function registerSupportRoutes(fastify: FastifyInstance) {
  // Public: Send a support message (no login required)
  fastify.post("/support/message", async (request, reply) => {
    const parsed = publicMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, message: "Invalid request. Provide name, email, and message content." });
    }
    const { name, email, content } = parsed.data;

    // Find or create a "guest" user for this email
    let guestUser = await prisma.user.findUnique({ where: { email } });
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email,
          name,
          role: "CUSTOMER",
        },
      });
    }

    // Find the first admin to route the message to
    const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (!admin) {
      return reply.status(500).send({ success: false, message: "No admin available to receive messages." });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: guestUser.id,
        receiverId: admin.id,
        content: `[${name}] ${content}`,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Real-time push to admin
    emitToUser(admin.id, "new_message", message);

    return reply.send({ success: true, message: "Message sent to support team.", userId: guestUser.id });
  });

  // Public: Get chat history for a guest user by email (no auth)
  fastify.get("/support/messages", async (request, reply) => {
    const { email } = request.query as { email?: string };
    if (!email) {
      return reply.status(400).send({ success: false, message: "Email is required." });
    }

    const guestUser = await prisma.user.findUnique({ where: { email } });
    if (!guestUser) {
      return reply.send({ success: true, messages: [] });
    }

    const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (!admin) {
      return reply.send({ success: true, messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: guestUser.id, receiverId: admin.id },
          { senderId: admin.id, receiverId: guestUser.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return reply.send({ success: true, messages, userId: guestUser.id });
  });
}
