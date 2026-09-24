import { requireDemoWrite } from "../../../../../lib/demo-auth";
import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";

export async function POST(req: Request) {
  const auth = requireDemoWrite(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const sql = getDb();
    const rows = await sql`
      INSERT INTO agents (organization_id, name, external_id, status, risk_level)
      SELECT id, 'Deploy Bot 07', 'deploy-bot-07', 'ACTIVE', 'CRITICAL'
      FROM organizations WHERE slug='sentrya-demo'
      ON CONFLICT (organization_id, external_id) DO UPDATE SET name=EXCLUDED.name
      RETURNING id, name, external_id, status, risk_level, created_at
    `;
    const resultRows = Array.from(rows as unknown as Array<Record<string, unknown>>);
    return NextResponse.json({ agent: resultRows[0] ?? null });
  } catch (error) {
    console.error("demo_seed_failed", error);
    return NextResponse.json({ error: "Demo agent seed failed" }, { status: 503 });
  }
}
