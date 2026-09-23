import { getDb } from "./db";

export type AgentStatus = "ACTIVE" | "PAUSED" | "KILLED";

export async function listAgents() {
  const sql = getDb();
  return sql`
    SELECT id, organization_id, name, external_id, status, risk_level, created_at
    FROM agents
    ORDER BY created_at DESC
  `;
}

export async function killAgent(id: string, reason = "Emergency kill switch", triggeredBy = "sentrya-console") {
  const sql = getDb();
  const rows = await sql`
    WITH target AS (
      SELECT id, organization_id, status
      FROM agents
      WHERE id = ${id}::uuid
      FOR UPDATE
    ),
    updated AS (
      UPDATE agents a
      SET status = 'KILLED'
      FROM target t
      WHERE a.id = t.id
      RETURNING a.id, a.organization_id, t.status AS previous_status, a.status AS new_status
    )
    INSERT INTO kill_switch_events
      (organization_id, agent_id, previous_status, new_status, reason, triggered_by)
    SELECT organization_id, id, previous_status, new_status, ${reason}, ${triggeredBy}
    FROM updated
    RETURNING agent_id, previous_status, new_status, created_at
  `;
  return rows[0] ?? null;
}
