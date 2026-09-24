import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET() {
  const checks: { api: string; database: string; demoTenant: string } = { api: "ok", database: "unknown", demoTenant: "unknown" };
  try {
    const sql = getDb();
    await sql`SELECT 1 AS ok`;
    checks.database = "ok";
    const org = await sql`SELECT id FROM organizations WHERE slug='sentrya-demo' LIMIT 1`;
    const orgRows = Array.from(org as unknown as Array<{ id?: unknown }>);
    checks.demoTenant = orgRows[0]?.id ? "ok" : "missing";
    const ready = checks.database === "ok" && checks.demoTenant === "ok";
    return NextResponse.json(
      { service: "sentrya", status: ready ? "ready" : "degraded", checks, version: "0.1.0", time: new Date().toISOString() },
      { status: ready ? 200 : 503 }
    );
  } catch (error) {
    console.error("readiness_failed", error);
    checks.database = "error";
    checks.demoTenant = "unknown";
    return NextResponse.json({ service: "sentrya", status: "degraded", checks, version: "0.1.0", time: new Date().toISOString() }, { status: 503 });
  }
}
