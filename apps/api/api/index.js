/** Vercel serverless entry — runs after `npm run build` produces `dist/app.js`. */
import handler from "../dist/app.js";

export default handler;
