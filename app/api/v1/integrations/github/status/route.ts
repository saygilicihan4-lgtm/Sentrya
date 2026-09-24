import { NextResponse } from "next/server";
import { requireDemoWrite } from "../../../../../../lib/demo-auth";
import { getGitHubAppConfig } from "../../../../../../lib/github-app";

export async function GET(req: Request) {
  const auth = requireDemoWrite(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const configured = Boolean(getGitHubAppConfig());
  return NextResponse.json({
    integration: "github",
    configured,
    mode: configured ? "github-app" : "not-configured",
    credentialsExposed: false
  });
}
