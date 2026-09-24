# Security Policy

SENTRYA is security infrastructure. Do not commit credentials, OAuth tokens, private keys, customer data, or production secrets.

## Current maturity

v0.1 is a pilot-stage MVP and must not be treated as production-grade authorization infrastructure.

Implemented in the current MVP:
- Neon-backed persistent agent, approval and audit data.
- Demo-tenant scoping for public reads and privileged mutations.
- HttpOnly, SameSite=Strict admin session with domain-separated HMAC signing.
- Human approval flow and idempotent emergency kill switch.
- Hash-linked, tamper-evident audit events.
- Public policy evaluation is read-only; persisted writes require an authenticated admin session.
- HMAC-signed agent requests with timestamp freshness checks.
- Signed GitHub pre-action authorization gate.
- GitHub App JWT / installation-token client with secrets kept outside the repository.
- GitHub webhook HMAC verification; forged webhook signatures are rejected.
- Least-privilege GitHub pilot design without repository Administration write.
- Baseline HTTP security headers and request-size limits on sensitive ingress paths.
- CI runtime tests for ALLOW, REQUIRE_APPROVAL, DENY, malformed input, signed/forged agent requests, signed/forged GitHub webhooks and admin-session authentication.

Still required before production use:
- Real multi-tenant identity and organization authorization.
- Durable nonce/replay prevention and agent-key rotation/revocation.
- Distributed rate limiting and brute-force protection for operator login.
- Dedicated CSRF tokens if future cross-site flows require them.
- Transactional/concurrency-safe audit-chain writes and stronger audit durability.
- External security review, incident-response procedures and production observability.
- Real GitHub App credentials/installation and end-to-end verification against a pilot repository.

## Reporting

Please report suspected vulnerabilities privately to the repository owner rather than opening a public exploit issue.
