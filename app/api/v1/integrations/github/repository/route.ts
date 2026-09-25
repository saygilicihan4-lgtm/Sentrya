import { NextResponse } from "next/server";
import { requireDemoWrite } from "../../../../../../lib/demo-auth";
import { createInstallationToken } from "../../../../../../lib/github-app";

const safeName = /^[A-Za-z0-9_.-]{1,100}$/;

export async function GET(req: Request) {
  const auth = requireDemoWrite(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const owner = url.searchParams.get("owner") ?? "saygilicihan4-lgtm";
  const repo = url.searchParams.get("repo") ?? "Sentrya";

  if (!safeName.test(owner) || !safeName.test(repo)) {
    return NextResponse.json({ error: "Invalid repository coordinates" }, { status: 400 });
  }

  try {
    const installation = await createInstallationToken();
    const response = await fetch(
      "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo),
      {
        headers: {
          accept: "application/vnd.github+json",
          authorization: "Bearer " + installation.token,
          "x-github-api-version": "2022-11-28",
          "user-agent": "sentrya-control-plane"
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "GitHub repository probe failed", githubStatus: response.status },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const data = await response.json() as {
      full_name?: unknown;
      private?: unknown;
      default_branch?: unknown;
      permissions?: unknown;
    };

    return NextResponse.json({
      integration: "github",
      connected: true,
      repository: typeof data.full_name === "string" ? data.full_name : owner + "/" + repo,
      private: data.private === true,
      defaultBranch: typeof data.default_branch === "string" ? data.default_branch : null,
      permissions: data.permissions ?? null,
      installationTokenExposed: false,
      installationTokenExpiresAt: installation.expiresAt
    });
  } catch (error) {
    console.error("github_repository_probe_failed", error);
    return NextResponse.json({ error: "GitHub App is not ready" }, { status: 503 });
  }
}
