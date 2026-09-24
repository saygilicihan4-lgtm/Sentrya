import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET(){
  try{
    const sql=getDb();
    const rows=await sql`SELECT ae.id,ae.event_type,ae.actor_type,ae.actor_id,ae.action,ae.resource,ae.decision,ae.risk_level,ae.event_hash,ae.prev_hash,ae.created_at
      FROM audit_events ae JOIN organizations o ON o.id=ae.organization_id
      WHERE o.slug='sentrya-demo' ORDER BY ae.created_at DESC LIMIT 50`;
    return NextResponse.json({events:rows});
  }catch(error){
    console.error("audit_list_failed",error);
    return NextResponse.json({error:"Audit ledger unavailable"},{status:503});
  }
}
