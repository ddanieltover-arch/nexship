import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@veloroute/db";
import { requireAuth } from "../lib/auth.js";
import { emitToUser } from "../realtime.js";

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1),
});

export async function registerChatRoutes(fastify: FastifyInstance) {
  // Admin: Get all chat threads (users who have sent or received messages)
  fastify.get("/chat/threads", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    if (user.role !== "ADMIN") {
      return reply.status(403).send({ success: false, message: "Forbidden" });
    }

    // Find all unique users involved in messages with admins
    // Since this is a simple implementation, we'll just get all users who aren't admins
    // and have at least one message.
    const users = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        OR: [
          { sentMessages: { some: {} } },
          { receivedMessages: { some: {} } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      }
    });

    return reply.send({ success: true, threads: users });
  });

  // Get messages with a specific user
  fastify.get("/chat/messages/:userId", { preHandler: [requireAuth] }, async (request, reply) => {
    const currentUser = request.user!;
    const otherUserId = (request.params as any).userId;

    // If current user is not admin, they can only chat with admins.
    // If current user is admin, they can chat with the specified user.
    if (currentUser.role !== "ADMIN") {
      // Find an admin to chat with (for simplicity, we assume any admin)
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (!admin) return reply.send({ success: true, messages: [] });
      
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: admin.id },
            { senderId: admin.id, receiverId: currentUser.id },
          ]
        },
        orderBy: { createdAt: "asc" }
      });
      return reply.send({ success: true, messages });
    } else {
      // Admin fetching messages for a specific user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUser.id },
          ]
        },
        orderBy: { createdAt: "asc" }
      });
      return reply.send({ success: true, messages });
    }
  });

  // Send a message
  fastify.post("/chat/messages", { preHandler: [requireAuth] }, async (request, reply) => {
    const currentUser = request.user!;
    const parsed = sendMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, message: "Invalid body" });
    }
    const { receiverId, content } = parsed.data;

    let targetReceiverId = receiverId;

    // If a customer is sending, we should route it to an admin if they didn't specify one
    if (currentUser.role !== "ADMIN") {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (admin) {
        targetReceiverId = admin.id;
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetReceiverId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Real-time update to the receiver
    emitToUser(targetReceiverId, "new_message", message);
    
    // Also emit to sender so their UI can update if they are on multiple devices
    emitToUser(currentUser.id, "new_message", message);

    return reply.send({ success: true, message });
  });
}
