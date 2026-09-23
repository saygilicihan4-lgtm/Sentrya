import { requireDemoWrite } from "../../../../lib/demo-auth";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT id, request_id, agent_external_id, action, resource, risk_level, reason, status, created_at, resolved_at, resolved_by FROM approval_requests ORDER BY created_at DESC LIMIT 50`;
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
    const { id, decision } = await req.json();
    if (!id || !["APPROVED","DENIED"].includes(decision)) return NextResponse.json({ error: "id and APPROVED/DENIED decision required" }, { status: 400 });
    const sql = getDb();
    const rows = await sql`UPDATE approval_requests SET status=${decision}, resolved_at=NOW(), resolved_by='human-demo' WHERE id=${id}::uuid AND status='PENDING' RETURNING id, request_id, action, status, resolved_at, resolved_by`;
    if (!rows[0]) return NextResponse.json({ error: "Pending approval not found" }, { status: 404 });
    return NextResponse.json({ approval: rows[0] });
  } catch (error) {
    console.error("approval_resolution_failed", error);
    return NextResponse.json({ error: "Approval resolution failed" }, { status: 503 });
  }
}
