import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { requireDemoWrite } from "../../../../../lib/demo-auth";

export async function GET(req: Request) {
  const auth = requireDemoWrite(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const sql = getDb();
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('organizations','agents','agent_scopes','policies','approval_requests','audit_events','kill_switch_events')
      ORDER BY table_name
    `;
    const names = tables.map((r: Record<string, unknown>) => String(r.table_name));
    const required = ['organizations','agents','agent_scopes','policies','approval_requests','audit_events','kill_switch_events'];
    const missing = required.filter(n => !names.includes(n));
    return NextResponse.json({ ok: missing.length===0, tables:names, missing });
  } catch (error) {
    console.error("schema_check_failed", error);
    return NextResponse.json({ error:"Schema check failed" }, { status:503 });
  }
}
