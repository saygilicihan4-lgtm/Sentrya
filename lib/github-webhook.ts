import { createHmac, timingSafeEqual } from "crypto";
import { getGitHubWebhookSecret } from "./github-app";

function webhookSecret() {
  return getGitHubWebhookSecret();
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export function verifyGitHubWebhook(request: Request, body: string) {
  const secret = webhookSecret();
  if (!secret) return { ok: false as const, status: 503, error: "GitHub webhook verification is disabled" };

  const signature = request.headers.get("x-hub-signature-256") ?? "";
  if (!signature.startsWith("sha256=")) {
    return { ok: false as const, status: 401, error: "Missing GitHub webhook signature" };
  }

  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  if (!safeEqual(signature, expected)) {
    return { ok: false as const, status: 401, error: "Invalid GitHub webhook signature" };
  }

  return { ok: true as const };
}
