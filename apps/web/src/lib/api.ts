const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

function serverSideApiBase(): string {
  const internal = process.env.INTERNAL_API_URL?.trim();
  if (internal) return internal;
  if (configuredApiUrl && configuredApiUrl.length > 0) return configuredApiUrl;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "NexShip: set NEXT_PUBLIC_API_URL or INTERNAL_API_URL for production server-side API requests."
    );
  }
  return "http://localhost:3001/api/v1";
}

export const API_BASE =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl
    : typeof window !== "undefined"
      ? "/api/v1"
      : serverSideApiBase();

/** Browser: same origin when unset (merged server). Server: INTERNAL_API_URL or public WS URL. */
export const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.trim() ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, unknown> };
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const h = new Headers(headers);
  if (!h.has("Content-Type") && rest.body && typeof rest.body === "string") {
    h.set("Content-Type", "application/json");
  }
  if (token) h.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = data as ApiErrorBody | null;
    throw new Error(err?.error?.message ?? res.statusText);
  }
  return data as T;
}
