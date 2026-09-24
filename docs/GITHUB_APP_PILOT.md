# GitHub App pilot configuration

SENTRYA's first GitHub pilot should use least privilege and selected-repository installation only.

## Phase 1 — verification pilot

Repository access:
- Metadata: read (GitHub grants this for repository metadata access).
- Contents: read.

Installation:
- Select only the Sentrya pilot repository.
- Do not grant repository Administration.
- Do not grant organization permissions.
- Do not grant Workflows write.

This phase lets SENTRYA verify the installation and read repository context without giving it destructive repository powers.

## Phase 2 — approval-gated pull requests

Only after the read-only pilot is verified:
- Pull requests: write.
- Contents: keep read unless a specific approved workflow requires write.

SENTRYA should evaluate the intended action before any GitHub mutation. Sensitive actions must remain behind the human approval flow.

## Defense in depth

The pilot GitHub App intentionally must not receive Administration write permission. Repository deletion requires Administration write, so a compromised pilot integration should not possess the GitHub permission needed to delete a repository even if an application-level policy check were bypassed.

## Deployment secrets

Store these only in the deployment secret manager:

- SENTRYA_GITHUB_APP_ID
- SENTRYA_GITHUB_INSTALLATION_ID
- SENTRYA_GITHUB_PRIVATE_KEY

Never commit the private key. The admin console's connection probe reports connectivity without returning the installation token or private key.
