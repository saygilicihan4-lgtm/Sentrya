# Security Policy

SENTRYA is security infrastructure. Do not commit credentials, OAuth tokens, private keys, customer data, or production secrets.

## Current maturity

v0.1 is an MVP and must not be treated as production-grade authorization.

Implemented in the current demo:
- Neon-backed persistent agent, approval, policy and audit data.
- Demo-tenant scoping for public reads and privileged mutations.
- HttpOnly admin session for protected operator actions.
- Human approval flow, emergency kill switch and tamper-evident hash-linked audit events.
- Public policy evaluation is read-only; persisted writes require an authenticated admin session.

Still required before production use:
- Real multi-tenant identity and authorization.
- Signed agent requests, nonce/replay protection and key rotation.
- Rate limiting and brute-force protection for operator login.
- CSRF hardening and production session-secret separation.
- Transactional/concurrency-safe audit-chain writes and stronger audit durability.
- End-to-end integration tests, security testing and incident-response procedures.

## Reporting

Please report suspected vulnerabilities privately to the repository owner rather than opening a public exploit issue.
