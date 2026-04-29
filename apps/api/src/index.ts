import "dotenv/config";
import { buildApp } from "./app.js";
import { attachSocketIo } from "./socket-bootstrap.js";

const PORT = Number(process.env.PORT ?? 3001);

async function main() {
  const app = await buildApp();
  await app.ready();
  attachSocketIo(app);

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`API listening on ${PORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
