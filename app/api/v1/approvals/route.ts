import { requireDemoWrite } from "../../../../lib/demo-auth";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT ar.id, ar.request_id, ar.agent_external_id, ar.action, ar.resource, ar.risk_level, ar.reason, ar.status, ar.created_at, ar.resolved_at, ar.resolved_by
      FROM approval_requests ar JOIN organizations o ON o.id=ar.organization_id
      WHERE o.slug='sentrya-demo' ORDER BY ar.created_at DESC LIMIT 50`;
    return NextResponse.json({ approvals: rows });
  } catch (error) {
    console.error("approval_list_failed", error);
    return NextResponse.json({ error: "Approval center unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireDemoWrite(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await req.json() as { id?: unknown; decision?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    const decision = typeof body.decision === "string" ? body.decision : "";
    if (!id || !["APPROVED","DENIED"].includes(decision)) return NextResponse.json({ error: "id and APPROVED/DENIED decision required" }, { status: 400 });
    const sql = getDb();
    const rows = await sql`UPDATE approval_requests ar SET status=${decision}, resolved_at=NOW(), resolved_by='human-demo'
      FROM organizations o WHERE ar.organization_id=o.id AND o.slug='sentrya-demo' AND ar.id=${id}::uuid AND ar.status='PENDING'
      RETURNING ar.id, ar.request_id, ar.action, ar.status, ar.resolved_at, ar.resolved_by`;
    const resultRows = Array.from(rows as unknown as Array<Record<string, unknown>>);
    if (!resultRows[0]) return NextResponse.json({ error: "Pending approval not found" }, { status: 404 });
    return NextResponse.json({ approval: resultRows[0] });
  } catch (error) {
    console.error("approval_resolution_failed", error);
    return NextResponse.json({ error: "Approval resolution failed" }, { status: 503 });
  }
}
