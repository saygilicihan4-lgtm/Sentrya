import { NextResponse } from "next/server";
import { createGitHubAppJwt, getGitHubAppConfig } from "../../../../../../lib/github-app";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getGitHubAppConfig();
  if (!config) {
    return NextResponse.json({
      ok: false,
      stage: "configuration",
      appIdPresent: Boolean(process.env.SENTRYA_GITHUB_APP_ID),
      installationIdPresent: Boolean(process.env.SENTRYA_GITHUB_INSTALLATION_ID),
      privateKeyPresent: Boolean(process.env.SENTRYA_GITHUB_PRIVATE_KEY)
    }, { status: 503 });
  }

  let jwt: string;
  try {
    jwt = createGitHubAppJwt(config);
  } catch {
    return NextResponse.json({ ok: false, stage: "private-key-signing" }, { status: 503 });
  }

  const tokenResponse = await fetch(
    "https://api.github.com/app/installations/" + encodeURIComponent(config.installationId) + "/access_tokens",
    {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: "Bearer " + jwt,
        "x-github-api-version": "2022-11-28",
        "user-agent": "sentrya-production-diagnostic"
      },
      cache: "no-store"
    }
  );

  if (!tokenResponse.ok) {
    return NextResponse.json({ ok: false, stage: "installation-token", githubStatus: tokenResponse.status }, { status: 503 });
  }
  const tokenData = await tokenResponse.json() as { token?: unknown };
  if (typeof tokenData.token !== "string") {
    return NextResponse.json({ ok: false, stage: "installation-token-body" }, { status: 503 });
  }

  const repoResponse = await fetch("https://api.github.com/repos/saygilicihan4-lgtm/Sentrya", {
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + tokenData.token,
      "x-github-api-version": "2022-11-28",
      "user-agent": "sentrya-production-diagnostic"
    },
    cache: "no-store"
  });
  if (!repoResponse.ok) {
    return NextResponse.json({ ok: false, stage: "repository", githubStatus: repoResponse.status }, { status: 503 });
  }
  const data = await repoResponse.json() as { full_name?: unknown; default_branch?: unknown };
  return NextResponse.json({
    ok: true,
    integration: "github-app",
    repository: typeof data.full_name === "string" ? data.full_name : null,
    defaultBranch: typeof data.default_branch === "string" ? data.default_branch : null,
    credentialsExposed: false
  });
}
