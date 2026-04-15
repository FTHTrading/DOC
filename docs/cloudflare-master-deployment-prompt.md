# Master VS Code Prompt — Cloudflare Native DOC OS Deployment

Copy all text below into VS Code Copilot Chat (Agent mode) in the DOC repo root.

---

You are GPT-5.3-Codex. Convert DOC OS into a Cloudflare-native production deployment.

## Mission

Deploy DOC OS with this architecture:

- `doc.unykorn.org` -> Next.js app on Cloudflare Workers (OpenNext adapter)
- `admin.doc.unykorn.org` -> Admin Next.js app on Cloudflare Workers (OpenNext adapter)
- `api.doc.unykorn.org` -> API Worker
- Queues + Workflows for orchestration
- Durable Objects for stateful coordination
- R2 for documents/statements/uploads
- Hyperdrive for Postgres connectivity
- Zero Trust Access for admin
- WAF managed + custom rules

## Implementation Steps

1. Add OpenNext Cloudflare build support to public and admin apps.
2. Add Worker API entrypoint for `apps/api` (Cloudflare runtime-friendly adapter).
3. Implement Durable Object classes:
   - WalletSessionDO
   - ApprovalRoomDO
   - DealRoomDO
   - CommandRoomDO
4. Add Queue producers/consumers for issuance, payments, AI, compliance, notifications.
5. Add Workflow handlers for onboarding, approvals, payouts.
6. Add R2 storage service wrapper for docs and statement artifacts.
7. Add Hyperdrive DB client wrapper for Worker execution path.
8. Add Zero Trust + WAF runbook with exact policy/rule names.
9. Add deployment scripts and environment validation.
10. Provide final smoke test commands and rollback plan.

## Required Artifacts

- `cloudflare/wrangler.doc-web.toml`
- `cloudflare/wrangler.admin-web.toml`
- `cloudflare/wrangler.api.toml`
- `docs/cloudflare-domain-mapping-plan.md`
- `docs/cloudflare-operations-runbook.md`
- CI checks ensuring route/binding drift is detected

## Domain Mapping

- `doc.unykorn.org/*` -> `doc-web`
- `admin.doc.unykorn.org/*` -> `doc-admin`
- `api.doc.unykorn.org/*` -> `doc-api`

## Security

- Access policy required for admin hostname
- Strict rate limits for auth, issuance, command execution, payment routes
- WAF managed rules enabled globally
- mTLS optional for internal operator routes

## Acceptance Criteria

- Public app deployed and globally reachable
- Admin app blocked unless Access identity policy passes
- API worker healthy and connected through Hyperdrive
- Queue message production confirmed from issuance and payment APIs
- Durable Object state survives concurrent client actions
- R2 uploads and retrieval verified
- Full audit trail persisted for issuance/payment commands

Start implementation now and do not stop until build, deploy config, and docs are complete.
