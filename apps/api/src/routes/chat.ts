import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma, Role } from "@veloroute/db";
import { requireAuth } from "../middleware/auth.js";
import { emitToUser } from "../realtime.js";

function debugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  // #region agent log
  void fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run2',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1),
});

export async function registerChatRoutes(fastify: FastifyInstance) {
  // Admin: Get all chat threads (users who have sent or received messages)
  fastify.get("/chat/threads", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    if (user.role !== Role.ADMIN) {
      return reply.status(403).send({ success: false, message: "Forbidden" });
    }

    // Find all unique users involved in messages with admins
    // Since this is a simple implementation, we'll just get all users who aren't admins
    // and have at least one message.
    const users = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
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
    debugLog("H5", "api/routes/chat.ts:getMessages:entry", "Chat messages endpoint called", {
      requesterRole: currentUser.role,
      requesterId: currentUser.id,
      otherUserId,
    });

    // If current user is not admin, they can only chat with admins.
    // If current user is admin, they can chat with the specified user.
    if (currentUser.role !== Role.ADMIN) {
      // Find an admin to chat with (for simplicity, we assume any admin)
      const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
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
      debugLog("H5", "api/routes/chat.ts:getMessages:customerResult", "Customer messages loaded", {
        count: messages.length,
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
      debugLog("H5", "api/routes/chat.ts:getMessages:adminResult", "Admin messages loaded", {
        count: messages.length,
      });
      return reply.send({ success: true, messages });
    }
  });

  // Send a message
  fastify.post("/chat/messages", { preHandler: [requireAuth] }, async (request, reply) => {
    const currentUser = request.user!;
    const parsed = sendMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      debugLog("H6", "api/routes/chat.ts:postMessages:invalidBody", "Chat send validation failed", {});
      return reply.status(400).send({ success: false, message: "Invalid body" });
    }
    const { receiverId, content } = parsed.data;

    let targetReceiverId = receiverId;

    // If a customer is sending, we should route it to an admin if they didn't specify one
    if (currentUser.role !== Role.ADMIN) {
      const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
      if (admin) {
        targetReceiverId = admin.id;
      }
    }
    debugLog("H6", "api/routes/chat.ts:postMessages:resolvedReceiver", "Resolved chat receiver", {
      senderId: currentUser.id,
      senderRole: currentUser.role,
      targetReceiverId,
    });

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
    debugLog("H6", "api/routes/chat.ts:postMessages:success", "Chat message persisted and emitted", {
      messageId: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
    });

    return reply.send({ success: true, message });
  });
}
