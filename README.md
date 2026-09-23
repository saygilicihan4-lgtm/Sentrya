# SENTRYA

Trust Infrastructure for AI Workers.

## MVP
SENTRYA is a control plane for AI agents: agent identity, least-privilege authorization, human approval gates, audit trails and emergency kill switch.

## Demo scenario
An AI agent attempts `github.delete_repository`. SENTRYA evaluates policy, blocks the critical action, creates a human approval request and records the event.

## Run
```bash
npm install
npm run dev
```

## Next milestones
1. Real policy engine API
2. Persistent agent/action model
3. GitHub integration
4. Human approval workflow
5. Authentication and organization isolation
6. Deployment + design-partner pilot


<!-- Production deployment trigger: 2026-09-24 -->
