export const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1")
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

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
