# SENTRYA

**Trust Infrastructure for AI Workers**

SENTRYA is an early-stage control plane for AI agents. It sits between an agent and sensitive tools so organizations can identify agents, evaluate policy, require human approval, keep a tamper-evident action trail and stop an agent in an emergency.

## Verified MVP capabilities

- Neon-backed Agent Registry, Approval Center and Audit Ledger.
- Policy Engine with ALLOW, DENY and REQUIRE_APPROVAL decisions.
- Protected operator console with HttpOnly admin session.
- Idempotent Emergency Kill Switch.
- Hash-linked, tamper-evident audit events.
- Public read-only demo plus authenticated persisted simulations.
- HMAC-signed agent request verification with timestamp freshness.
- Signed GitHub pre-action authorization gate.
- GitHub App JWT / installation-token client and protected connection probe.
- HMAC-verified GitHub webhook endpoint.
- Least-privilege GitHub pilot profile.
- Health/readiness endpoints, baseline HTTP security headers and sensitive-request size limits.
- GitHub Actions verification covering TypeScript, production build and runtime security/API smoke tests.

## Demo flow

A public caller can evaluate an action without mutating persistent state. An AI agent attempting `github.delete_repository` receives `DENY / CRITICAL`.

Authenticated operators can run protected simulations. A `REQUIRE_APPROVAL` decision is persisted, appears in the Approval Center and can be approved or denied by a human. Persisted evaluations are added to the hash-linked audit ledger.

For the GitHub pilot, an agent signs its request before asking SENTRYA to authorize a GitHub operation. SENTRYA evaluates the intended operation before execution. The first real installation is intentionally read-only and must not receive repository Administration write permission.

## Architecture

`Agent Registry → Signed Identity → Policy Engine → Approval Center → Action Ledger → Kill Switch`

GitHub pilot: `AI Agent → Signed SENTRYA Gate → Policy Decision → Human Approval when required → Least-Privilege GitHub App`

## API

- `GET /api/v1/health` — process health.
- `GET /api/v1/ready` — database and demo-tenant readiness.
- `POST /api/v1/evaluate` — public read-only policy evaluation; authenticated calls may persist.
- `POST /api/v1/agent/evaluate` — HMAC-signed agent evaluation.
- `POST /api/v1/integrations/github/authorize` — signed GitHub pre-action authorization.
- `POST /api/v1/integrations/github/webhook` — verified GitHub App webhook ingress.
- `GET /api/v1/integrations/github/status` — protected configuration status.
- `GET /api/v1/integrations/github/repository` — protected live repository connection probe.
- `GET /api/v1/agents` — demo-tenant agent registry.
- `GET /api/v1/approvals` — demo-tenant approval requests.
- `GET /api/v1/audit` — demo-tenant audit ledger.
- `POST /api/v1/admin/login` — establish protected operator session.
- `POST /api/v1/agents/:id/kill` — authenticated emergency stop.

## Configuration

Persistent database features require `DATABASE_URL`. Privileged demo actions require `SENTRYA_DEMO_ADMIN_KEY`. Signed agent calls use `SENTRYA_AGENT_SIGNING_KEY`.

The GitHub pilot uses:
- `SENTRYA_GITHUB_APP_ID`
- `SENTRYA_GITHUB_INSTALLATION_ID`
- `SENTRYA_GITHUB_PRIVATE_KEY`
- `SENTRYA_GITHUB_WEBHOOK_SECRET`

Keep all real credentials in the deployment secret manager. Never commit them.

## Local development

```bash
npm install
npm run dev
```

## Production-readiness boundary

v0.1 is a hardened pilot MVP, not production-grade authorization infrastructure. Durable replay prevention/key rotation, real multi-tenant authorization, distributed rate limiting, concurrency-safe audit writes, production observability and an external security review remain required. See `SECURITY.md`.

## Pilot completion gate

The code-side GitHub integration is ready for a read-only pilot. Completion requires a real GitHub App installation with least-privilege permissions, deployment secrets configured outside Git, a successful protected repository probe and an end-to-end read-only test. See `docs/GITHUB_APP_PILOT.md`.
