import { NextResponse } from "next/server";
import { createInstallationToken } from "../../../../../../lib/github-app";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const installation = await createInstallationToken();
    const response = await fetch("https://api.github.com/repos/saygilicihan4-lgtm/Sentrya", {
      headers: {
        accept: "application/vnd.github+json",
        authorization: "Bearer " + installation.token,
        "x-github-api-version": "2022-11-28",
        "user-agent": "sentrya-production-diagnostic"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, githubStatus: response.status }, { status: 503 });
    }

    const data = await response.json() as { full_name?: unknown; default_branch?: unknown };
    return NextResponse.json({
      ok: true,
      integration: "github-app",
      repository: typeof data.full_name === "string" ? data.full_name : null,
      defaultBranch: typeof data.default_branch === "string" ? data.default_branch : null,
      credentialsExposed: false
    });
  } catch {
    return NextResponse.json({ ok: false, error: "github-app-not-ready" }, { status: 503 });
  }
}
