import { NextResponse } from "next/server";
import { verifyAgentRequest } from "../../../../../../lib/agent-auth";
import { evaluatePolicy } from "../../../../../../lib/policy";

const githubActions: Record<string, string> = {
  read_repository: "github.read_repository",
  merge_pull_request: "github.merge_pull_request",
  update_branch_protection: "github.update_branch_protection",
  delete_repository: "github.delete_repository",
  delete_organization: "github.delete_organization"
};

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const auth = verifyAgentRequest(req, bodyText);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const raw = JSON.parse(bodyText) as {
      operation?: unknown;
      repository?: unknown;
      ref?: unknown;
    };

    const operation = typeof raw.operation === "string" ? raw.operation : "";
    const repository = typeof raw.repository === "string" ? raw.repository : "";
    const ref = typeof raw.ref === "string" ? raw.ref : undefined;
    const action = githubActions[operation];

    if (!action || !repository) {
      return NextResponse.json(
        { error: "Supported GitHub operation and repository are required" },
        { status: 400 }
      );
    }

    const result = evaluatePolicy({
      agentId: auth.agentId,
      action,
      resource: repository
    });

    return NextResponse.json({
      integration: "github",
      enforcementPoint: "pre-action",
      authenticated: true,
      agentId: auth.agentId,
      operation,
      action,
      repository,
      ref: ref ?? null,
      ...result,
      mayExecute: result.decision === "ALLOW",
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("github_authorization_failed", error);
    return NextResponse.json({ error: "GitHub authorization check failed" }, { status: 400 });
  }
}
