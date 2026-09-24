import { getDb } from "./db";

export type AgentStatus = "ACTIVE" | "PAUSED" | "KILLED";

export async function listAgents() {
  const sql = getDb();
  return sql`
    SELECT a.id, a.organization_id, a.name, a.external_id, a.status, a.risk_level, a.created_at
    FROM agents a
    JOIN organizations o ON o.id = a.organization_id
    WHERE o.slug = 'sentrya-demo'
    ORDER BY a.created_at DESC
    LIMIT 50
  `;
}

export async function killAgent(id: string, reason = "Emergency kill switch", triggeredBy = "sentrya-console") {
  const sql = getDb();
  const rows = await sql`
    WITH target AS (
      SELECT a.id, a.organization_id, a.status
      FROM agents a
      JOIN organizations o ON o.id = a.organization_id
      WHERE a.id = ${id}::uuid AND o.slug = 'sentrya-demo'
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
  const resultRows = Array.from(rows as unknown as Array<Record<string, unknown>>);
  return resultRows[0] ?? null;
}
