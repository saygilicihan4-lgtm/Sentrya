import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { evaluatePolicy } from "../../../../lib/policy";
import { getDb } from "../../../../lib/db";
import { requireDemoWrite } from "../../../../lib/demo-auth";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json() as { agentId?: unknown; action?: unknown; resource?: unknown };
    const body = {
      agentId: typeof raw.agentId === "string" ? raw.agentId : "",
      action: typeof raw.action === "string" ? raw.action : "",
      resource: typeof raw.resource === "string" ? raw.resource : undefined
    };
    if (!body.agentId || !body.action) return NextResponse.json({ error: "agentId and action are required" }, { status: 400 });

    const result = evaluatePolicy(body);
    const requestId = randomUUID();
    const auth = requireDemoWrite(req);

    // Public demo evaluations are intentionally read-only. Only authenticated
    // admin requests may create approval requests or audit records.
    if (auth.ok) {
      const sql = getDb();
      const orgs = await sql`SELECT id FROM organizations WHERE slug = 'sentrya-demo' LIMIT 1`;
      const orgRows = Array.from(orgs as unknown as Array<{ id?: unknown }>);
      const organizationId = orgRows[0]?.id as string | undefined;

      if (organizationId) {
        const last = await sql`SELECT event_hash FROM audit_events WHERE organization_id = ${organizationId}::uuid ORDER BY created_at DESC LIMIT 1`;
        const lastRows = Array.from(last as unknown as Array<{ event_hash?: unknown }>);
        const prevHash = (lastRows[0]?.event_hash as string | undefined) ?? null;
        const payload = JSON.stringify({ requestId, agentId: body.agentId, action: body.action, resource: body.resource ?? null, decision: result.decision, risk: result.risk });
        const eventHash = createHash("sha256").update((prevHash ?? "") + payload).digest("hex");
        await sql`INSERT INTO audit_events (organization_id, event_type, actor_type, actor_id, action, resource, decision, risk_level, metadata, prev_hash, event_hash)
          VALUES (${organizationId}::uuid, 'POLICY_EVALUATED', 'AGENT', ${String(body.agentId)}, ${String(body.action)}, ${body.resource ?? null}, ${result.decision}, ${result.risk}, ${JSON.stringify({requestId, reason: result.reason})}::jsonb, ${prevHash}, ${eventHash})`;

        if (result.decision === "REQUIRE_APPROVAL") {
          await sql`INSERT INTO approval_requests (organization_id, request_id, agent_external_id, action, resource, risk_level, reason, status)
            VALUES (${organizationId}::uuid, ${requestId}::uuid, ${String(body.agentId)}, ${String(body.action)}, ${body.resource ?? null}, ${result.risk}, ${result.reason}, 'PENDING')`;
        }
      }
    }

    return NextResponse.json({ requestId, agentId: body.agentId, action: body.action, resource: body.resource ?? null, ...result, persisted: auth.ok, evaluatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("policy_evaluation_failed", error);
    return NextResponse.json({ error: "Policy evaluation failed" }, { status: 500 });
  }
}
