import type { FastifyInstance } from "fastify";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { AppError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

// Make sure to register multipart in app.ts, not here
export async function registerUploadRoutes(app: FastifyInstance) {
  const uploadDir = path.join(process.cwd(), "uploads");
  
  // Ensure directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create uploads directory", err);
  }

  app.post(
    "/upload",
    { preHandler: [requireAuth] },
    async (req, reply) => {
      const data = await req.file();
      if (!data) throw new AppError("VALIDATION_ERROR", "No file uploaded", 400);

      const isImage = data.mimetype.startsWith("image/");
      const ext = isImage ? ".webp" : path.extname(data.filename);
      const filename = `${randomUUID()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      if (isImage) {
        // Compress and convert to WebP
        const buffer = await data.toBuffer();
        const { default: sharp } = await import("sharp");
        await sharp(buffer)
          .webp({ quality: 80 }) // Compress to 80% quality
          .toFile(filepath);
      } else {
        // Save as is for non-images (PDFs, etc)
        const buffer = await data.toBuffer();
        await fs.writeFile(filepath, buffer);
      }

      // Return the URL (assuming API serves /uploads statically)
      const url = `/api/v1/uploads/${filename}`;
      return reply.send({ 
        url, 
        filename: data.filename,
        mimeType: isImage ? "image/webp" : data.mimetype 
      });
    }
  );
}
