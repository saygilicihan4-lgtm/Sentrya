import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "sentrya_admin";
const SESSION_TTL_SECONDS = 60 * 60;

function secret() {
  return process.env.SENTRYA_DEMO_ADMIN_KEY ?? "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export function verifyAdminKey(provided: string) {
  const expected = secret();
  return Boolean(expected && provided && safeEqual(provided, expected));
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expires);
  return { value: payload + "." + sign(payload), maxAge: SESSION_TTL_SECONDS };
}

export function adminCookieName() {
  return COOKIE_NAME;
}

function hasValidSession(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const raw = cookie.split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE_NAME + "="))?.slice(COOKIE_NAME.length + 1);
  if (!raw || !secret()) return false;
  const [expires, signature] = raw.split(".");
  if (!expires || !signature || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(expires));
}

export function requireDemoWrite(request: Request) {
  if (hasValidSession(request)) return { ok: true as const };
  const provided = request.headers.get("x-sentrya-admin-key") ?? "";
  if (verifyAdminKey(provided)) return { ok: true as const };
  if (!secret()) return { ok: false as const, status: 503, error: "Demo writes are disabled" };
  return { ok: false as const, status: 401, error: "Unauthorized" };
}
