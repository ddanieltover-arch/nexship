import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sendContactFormEmail } from "../services/email.js";
import { AppError } from "../lib/errors.js";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function registerContactRoutes(app: FastifyInstance) {
  app.post("/contact", async (req, reply) => {
    const body = contactSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid body", 400, { issues: body.error.flatten() });
    }

    await sendContactFormEmail(body.data);
    
    return reply.send({ success: true, message: "Message sent successfully" });
  });
}
