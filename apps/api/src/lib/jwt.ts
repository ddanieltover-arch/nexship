import jwt, { type SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";
const ACCESS_TTL = (process.env.JWT_ACCESS_EXPIRES ?? "15m") as SignOptions["expiresIn"];
const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "7");

export type AccessPayload = { sub: string; email: string; role: string };

export function signAccessToken(payload: AccessPayload): string {
  const opts: SignOptions = { expiresIn: ACCESS_TTL };
  return jwt.sign(payload, ACCESS_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, ACCESS_SECRET) as AccessPayload;
  return decoded;
}

export function signRefreshToken(userId: string): string {
  const days = Number.isFinite(REFRESH_TTL_DAYS) && REFRESH_TTL_DAYS > 0 ? REFRESH_TTL_DAYS : 7;
  const refreshOpts: SignOptions = { expiresIn: `${days}d` as SignOptions["expiresIn"] };
  return jwt.sign({ sub: userId, typ: "refresh" }, REFRESH_SECRET, refreshOpts);
}

export function verifyRefreshToken(token: string): { sub: string } {
  const decoded = jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload & { sub: string; typ?: string };
  if (decoded.typ !== "refresh") throw new Error("Invalid refresh token");
  return { sub: decoded.sub };
}
