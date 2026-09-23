import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";

export async function POST() {
  try {
    const sql = getDb();
    const rows = await sql`
      INSERT INTO agents (organization_id, name, external_id, status, risk_level)
      SELECT id, 'Deploy Bot 07', 'deploy-bot-07', 'ACTIVE', 'CRITICAL'
      FROM organizations WHERE slug='sentrya-demo'
      ON CONFLICT (organization_id, external_id) DO UPDATE SET name=EXCLUDED.name
      RETURNING id, name, external_id, status, risk_level, created_at
    `;
    return NextResponse.json({ agent: rows[0] ?? null });
  } catch (error) {
    console.error("demo_seed_failed", error);
    return NextResponse.json({ error: "Demo agent seed failed" }, { status: 503 });
  }
}
