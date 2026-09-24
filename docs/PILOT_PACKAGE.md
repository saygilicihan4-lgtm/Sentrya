# SENTRYA Design-Partner Pilot

## Goal

Validate that an AI-agent team can place SENTRYA between an autonomous worker and GitHub, apply policy before execution, route sensitive actions to a human and retain an auditable decision trail.

## Pilot scope — 2 weeks

Week 1:
- Install the SENTRYA GitHub App on one selected non-critical repository.
- Start read-only: repository metadata and contents only.
- Register one AI agent identity.
- Verify signed agent requests and GitHub webhook delivery.
- Exercise ALLOW, REQUIRE_APPROVAL and DENY policy paths.

Week 2:
- Add one approval-gated workflow chosen with the design partner.
- Measure authorization latency, approval turnaround and blocked sensitive actions.
- Review audit events and operator experience.
- Decide whether to expand permissions or repositories.

## Safety boundary

The first pilot does not grant repository Administration write. Destructive repository operations remain unavailable at the GitHub permission layer as well as blocked by SENTRYA policy. Production secrets stay in the deployment secret manager and are never committed to Git.

## Success metrics

- 100% of pilot agent GitHub actions pass through the SENTRYA gate.
- 100% of forged agent signatures and forged GitHub webhook signatures are rejected.
- Sensitive configured actions are never executed without the required decision/approval.
- Median policy decision latency is recorded.
- Human approval turnaround is recorded.
- Every persisted protected simulation has an audit event.
- Zero production destructive writes during the read-only pilot.

## 15-minute demo

1. Show Agent Registry and active agent.
2. Run a harmless read action → ALLOW.
3. Attempt a sensitive action → REQUIRE_APPROVAL.
4. Approve/deny from the operator console.
5. Attempt repository deletion → DENY / CRITICAL.
6. Show the hash-linked audit event.
7. Trigger the Emergency Kill Switch.
8. Show GitHub App connection status and explain least-privilege installation.

## Design-partner ask

Provide one technical owner, one non-critical GitHub repository and one representative AI-agent workflow. SENTRYA provides setup support, policy configuration, the operator console and a short end-of-pilot findings report.

## Evidence to collect

- Number of evaluated actions.
- ALLOW / REQUIRE_APPROVAL / DENY distribution.
- Number of human approvals and denials.
- Number of blocked high/critical actions.
- Policy latency and approval latency.
- Agent kill-switch events.
- Partner feedback and requested integrations.

These measurements become the basis for product prioritization and future fundraising material; they should be reported as observed pilot data, not projected traction.
