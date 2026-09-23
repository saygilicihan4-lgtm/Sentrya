import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
export async function GET(){
  try{
    const sql=getDb();
    const rows=await sql`SELECT id,event_type,actor_type,actor_id,action,resource,decision,risk_level,event_hash,prev_hash,created_at FROM audit_events ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({events:rows});
  }catch(error){console.error("audit_list_failed",error);return NextResponse.json({error:"Audit ledger unavailable"},{status:503});}
}
