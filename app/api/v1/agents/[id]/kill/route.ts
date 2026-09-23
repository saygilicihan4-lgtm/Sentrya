import { NextResponse } from "next/server";
import { killAgent } from "../../../../../../lib/store";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
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
