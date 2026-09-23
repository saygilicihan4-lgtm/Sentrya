export function requireDemoWrite(request: Request) {
  const expected = process.env.SENTRYA_DEMO_ADMIN_KEY;
  if (!expected) return { ok: false as const, status: 503, error: "Demo writes are disabled" };
  const provided = request.headers.get("x-sentrya-admin-key");
  if (!provided || provided !== expected) return { ok: false as const, status: 401, error: "Unauthorized" };
  return { ok: true as const };
}
