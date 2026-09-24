import { NextResponse } from "next/server";
import { verifyGitHubWebhook } from "../../../../../../lib/github-webhook";

const acceptedEvents = new Set(["ping", "installation", "installation_repositories", "repository"]);

export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 1_000_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const bodyText = await req.text();
  if (Buffer.byteLength(bodyText, "utf8") > 1_000_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const verified = verifyGitHubWebhook(req, bodyText);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: verified.status });

  const event = req.headers.get("x-github-event") ?? "";
  const delivery = req.headers.get("x-github-delivery") ?? "";

  if (!acceptedEvents.has(event)) {
    return NextResponse.json({ accepted: true, ignored: true, event, delivery });
  }

  try {
    const payload = JSON.parse(bodyText) as {
      zen?: unknown;
      action?: unknown;
      installation?: { id?: unknown };
      repository?: { full_name?: unknown };
    };

    return NextResponse.json({
      accepted: true,
      verified: true,
      event,
      delivery,
      action: typeof payload.action === "string" ? payload.action : null,
      installationId: typeof payload.installation?.id === "number" ? payload.installation.id : null,
      repository: typeof payload.repository?.full_name === "string" ? payload.repository.full_name : null,
      ping: event === "ping"
    });
  } catch {
    return NextResponse.json({ error: "Invalid GitHub webhook payload" }, { status: 400 });
  }
}
