# SENTRYA

**Trust Infrastructure for AI Workers**

SENTRYA is an early-stage control plane for AI agents. It sits between an agent and sensitive tools so organizations can identify agents, evaluate policy, require human approval, keep a tamper-evident action trail and stop an agent in an emergency.

## Current MVP

- Agent Registry backed by Neon Postgres.
- Policy Engine with ALLOW, DENY and REQUIRE_APPROVAL decisions.
- Human Approval Center for authenticated operator sessions.
- Emergency Kill Switch scoped to the demo tenant.
- Hash-linked, tamper-evident audit events.
- Public read-only investor/design-partner demo.
- Protected admin console using an HttpOnly session.
- Readiness and health endpoints.
- GitHub Actions verification: TypeScript, production build and runtime API smoke tests.
- Vercel deployment from `main`.

## Demo flow

The public demo can evaluate an action without mutating persistent state. For example, an AI agent attempting `github.delete_repository` receives a `DENY / CRITICAL` decision.

Authenticated operators can run a protected simulation such as `gmail.send_email`. A `REQUIRE_APPROVAL` result is persisted, appears in the Approval Center, and can be approved or denied by a human. Persisted policy evaluations are added to the hash-linked audit ledger.

## Architecture

`Agent Registry → Policy Engine → Approval Center → Action Ledger → Kill Switch`

## API

- `GET /api/v1/health` — process health.
- `GET /api/v1/ready` — database and demo-tenant readiness.
- `POST /api/v1/evaluate` — policy evaluation; public calls are read-only.
- `GET /api/v1/agents` — demo-tenant agent registry.
- `GET /api/v1/approvals` — demo-tenant approval requests.
- `GET /api/v1/audit` — demo-tenant audit ledger.
- `POST /api/v1/admin/login` — establish protected operator session.
- `POST /api/v1/agents/:id/kill` — authenticated emergency stop.

## Local development

```bash
npm install
npm run dev
```

For persistent database features, configure `DATABASE_URL`. Privileged demo actions also require `SENTRYA_DEMO_ADMIN_KEY`. Never commit either value.

## Production-readiness boundary

v0.1 is an MVP, not production-grade authorization infrastructure. Before production use SENTRYA still needs real multi-tenant identity and authorization, signed agent requests, nonce/replay protection, rate limiting, stronger session/CSRF controls, concurrency-safe audit-chain writes, integration/security testing and incident-response procedures. See `SECURITY.md`.

## Next milestones

1. GitHub App integration with least-privilege permissions.
2. Signed agent identity and request verification.
3. Multi-tenant organization/auth model.
4. Durable approval and audit concurrency guarantees.
5. Design-partner integrations and measurable pilot usage.
6. Security review and production hardening.
