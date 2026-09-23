import { requireDemoWrite } from "../../../../../../lib/demo-auth";
import { NextResponse } from "next/server";
import { killAgent } from "../../../../../../lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireDemoWrite(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  try {
    const agent = await killAgent(id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    return NextResponse.json({ agent, event: "AGENT_KILLED", at: new Date().toISOString() });
  } catch (error) {
    console.error("agent_kill_failed", error);
    return NextResponse.json({ error: "Kill switch failed" }, { status: 503 });
  }
}
