import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { createGitHubAppJwt, getGitHubAppConfig, getGitHubWebhookSecret } from "../../../../../../lib/github-app";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getGitHubAppConfig();
  const secret = getGitHubWebhookSecret();
  if (!config || !secret) return NextResponse.json({ ok: false, stage: "configuration" }, { status: 503 });

  const response = await fetch("https://api.github.com/app/hook/config", {
    method: "PATCH",
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + createGitHubAppJwt(config),
      "content-type": "application/json",
      "x-github-api-version": "2026-03-10",
      "user-agent": "sentrya-control-plane"
    },
    body: JSON.stringify({
      url: "https://sentrya-pink.vercel.app/api/v1/integrations/github/webhook",
      content_type: "json",
      secret,
      insecure_ssl: "0"
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, stage: "github-webhook-config", githubStatus: response.status }, { status: 502 });
  }
  const data = await response.json() as { url?: unknown; content_type?: unknown; insecure_ssl?: unknown };

  const testBody = JSON.stringify({ zen: "SENTRYA production webhook self-test" });
  const signature = "sha256=" + createHmac("sha256", secret).update(testBody).digest("hex");
  const receiver = await fetch("https://sentrya-pink.vercel.app/api/v1/integrations/github/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": "ping",
      "x-github-delivery": "sentrya-bootstrap-self-test",
      "x-hub-signature-256": signature
    },
    body: testBody,
    cache: "no-store"
  });
  const receiverBody = await receiver.json() as { verified?: unknown; ping?: unknown };
  if (!receiver.ok || receiverBody.verified !== true || receiverBody.ping !== true) {
    return NextResponse.json({ ok: false, stage: "receiver-self-test", receiverStatus: receiver.status }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    webhookConfigured: true,
    receiverVerified: true,
    url: typeof data.url === "string" ? data.url : null,
    contentType: data.content_type ?? null,
    sslVerification: String(data.insecure_ssl ?? "0") === "0",
    secretExposed: false
  });
}
