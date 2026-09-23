import { NextResponse } from "next/server";
import { listAgents } from "../../../../lib/store";

export async function GET() {
  try {
    const agents = await listAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    console.error("agents_list_failed", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
