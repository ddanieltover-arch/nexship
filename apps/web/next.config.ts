import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Monorepo: load root `.env` so RESEND_* (and shared secrets) reach the Next server.
loadEnvConfig(path.join(__dirname, "../.."));

const nextConfig: NextConfig = {
  transpilePackages: [],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  async rewrites() {
    const publicApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
    /** Server-only proxy target when the browser uses same-origin `/api/v1` but `NEXT_PUBLIC_API_URL` is unset (optional on Vercel). */
    const rewriteOnlyBase = process.env.API_REWRITE_BASE_URL?.trim();
    /** Local dev default; on Vercel set `NEXT_PUBLIC_API_URL` and/or `API_REWRITE_BASE_URL` — never localhost. */
    const rawApiUrl =
      publicApiBase ||
      rewriteOnlyBase ||
      (process.env.VERCEL ? "" : "http://localhost:3001/api/v1");

    if (!rawApiUrl) {
      return [];
    }

    const apiUrl = new URL(rawApiUrl);
    const apiPathPrefix = apiUrl.pathname.replace(/\/$/, "") || "/api/v1";

    return [
      {
        source: `${apiPathPrefix}/:path*`,
        destination: `${apiUrl.origin}${apiPathPrefix}/:path*`,
      },
    ];
  },
};

export default nextConfig;
