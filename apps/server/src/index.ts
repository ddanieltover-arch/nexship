import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node:url";
import { createRequire } from "node:module";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { UrlWithParsedQuery } from "node:url";
import type { FastifyReply, FastifyRequest } from "fastify";
import { buildApp } from "@veloroute/api/app";
import { attachSocketIo } from "@veloroute/api/socket-bootstrap";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

/** Same-origin REST for Next RSC / server actions calling `apiFetch` without a public URL. */
if (!process.env.INTERNAL_API_URL?.trim()) {
  process.env.INTERNAL_API_URL = `http://127.0.0.1:${port}/api/v1`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, "../../web");

type NextServer = {
  prepare: () => Promise<void>;
  getRequestHandler: () => (
    req: IncomingMessage,
    res: ServerResponse,
    parsed?: UrlWithParsedQuery
  ) => Promise<void>;
};

const require = createRequire(import.meta.url);
/** Next is published as CJS; `import default` typings are wrong under `NodeNext`. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const createNextApp = require("next") as (opts: { dev?: boolean; dir?: string }) => NextServer;

async function main() {
  const dev = process.env.NODE_ENV !== "production";
  const nextApp = createNextApp({
    dev,
    dir: webDir,
  });
  const handle = nextApp.getRequestHandler();

  const fastify = await buildApp({ integrated: true });

  // Fastify 5: routing must be finalized before `ready()` (kState.started).
  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const parsedUrl = parse(request.url, true);
    reply.hijack();
    void handle(request.raw, reply.raw, parsedUrl).catch((err: unknown) => {
      fastify.log.error(err);
      if (!reply.raw.headersSent) {
        reply.raw.statusCode = 500;
        reply.raw.end("Internal Server Error");
      }
    });
  });

  await fastify.ready();
  attachSocketIo(fastify);
  await nextApp.prepare();

  await fastify.listen({ port, host });
  fastify.log.info({ port, host }, "Merged NexShip server (Next.js + API + WebSockets)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
