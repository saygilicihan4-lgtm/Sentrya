import { createHmac, timingSafeEqual } from "crypto";

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

function signingKey() {
  return process.env.SENTRYA_AGENT_SIGNING_KEY ?? "";
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export function signAgentRequest(agentId: string, timestamp: string, body: string) {
  const key = signingKey();
  if (!key) throw new Error("SENTRYA_AGENT_SIGNING_KEY is not configured");
  return createHmac("sha256", key).update(timestamp + "." + agentId + "." + body).digest("hex");
}

export function verifyAgentRequest(request: Request, body: string) {
  const key = signingKey();
  if (!key) return { ok: false as const, status: 503, error: "Signed agent requests are disabled" };

  const agentId = request.headers.get("x-sentrya-agent-id") ?? "";
  const timestamp = request.headers.get("x-sentrya-timestamp") ?? "";
  const signature = request.headers.get("x-sentrya-signature") ?? "";
  const epoch = Number(timestamp);

  if (!agentId || !signature || !Number.isFinite(epoch)) {
    return { ok: false as const, status: 401, error: "Missing signed request headers" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - epoch) > MAX_CLOCK_SKEW_SECONDS) {
    return { ok: false as const, status: 401, error: "Signed request expired" };
  }

  const expected = createHmac("sha256", key).update(timestamp + "." + agentId + "." + body).digest("hex");
  if (!safeEqual(signature, expected)) {
    return { ok: false as const, status: 401, error: "Invalid request signature" };
  }

  return { ok: true as const, agentId };
}
