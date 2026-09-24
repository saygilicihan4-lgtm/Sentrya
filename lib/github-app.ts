import { createSign } from "crypto";

type GitHubAppConfig = {
  appId: string;
  installationId: string;
  privateKey: string;
};

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

export function getGitHubAppConfig(): GitHubAppConfig | null {
  const appId = process.env.SENTRYA_GITHUB_APP_ID ?? "";
  const installationId = process.env.SENTRYA_GITHUB_INSTALLATION_ID ?? "";
  const privateKey = (process.env.SENTRYA_GITHUB_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!appId || !installationId || !privateKey) return null;
  return { appId, installationId, privateKey };
}

export function createGitHubAppJwt(config: GitHubAppConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iat: now - 60,
    exp: now + 9 * 60,
    iss: config.appId
  }));
  const unsigned = header + "." + payload;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return unsigned + "." + signer.sign(config.privateKey).toString("base64url");
}

export async function createInstallationToken() {
  const config = getGitHubAppConfig();
  if (!config) throw new Error("GitHub App is not configured");

  const response = await fetch(
    "https://api.github.com/app/installations/" + encodeURIComponent(config.installationId) + "/access_tokens",
    {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: "Bearer " + createGitHubAppJwt(config),
        "x-github-api-version": "2022-11-28",
        "user-agent": "sentrya-control-plane"
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("GitHub installation token request failed with status " + response.status);
  }

  const data = await response.json() as { token?: unknown; expires_at?: unknown };
  if (typeof data.token !== "string") throw new Error("GitHub installation token missing");
  return {
    token: data.token,
    expiresAt: typeof data.expires_at === "string" ? data.expires_at : null
  };
}
