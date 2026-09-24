import { NextResponse } from "next/server";
import { verifyAgentRequest } from "../../../../../lib/agent-auth";
import { evaluatePolicy } from "../../../../../lib/policy";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const auth = verifyAgentRequest(req, bodyText);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const raw = JSON.parse(bodyText) as { action?: unknown; resource?: unknown };
    const action = typeof raw.action === "string" ? raw.action : "";
    const resource = typeof raw.resource === "string" ? raw.resource : undefined;
    if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

    const result = evaluatePolicy({ agentId: auth.agentId, action, resource });
    return NextResponse.json({
      agentId: auth.agentId,
      action,
      resource: resource ?? null,
      ...result,
      authenticated: true,
      persisted: false,
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("signed_agent_evaluation_failed", error);
    return NextResponse.json({ error: "Signed policy evaluation failed" }, { status: 400 });
  }
}
