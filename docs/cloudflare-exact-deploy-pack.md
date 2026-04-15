# Cloudflare Exact Deploy Pack (DOC OS)

This is the live deployment path for DOC OS. Not localhost.

## Target Topology

- `doc.unykorn.org` -> Worker `doc-web`
- `admin.doc.unykorn.org` -> Worker `doc-admin`
- `api.doc.unykorn.org` -> Worker `doc-api`

## Files Included

- `cloudflare/doc-web/wrangler.jsonc`
- `cloudflare/admin-web/wrangler.jsonc`
- `cloudflare/api/wrangler.jsonc`
- `cloudflare/env.production.example`
- `cloudflare/deploy.ps1`
- `apps/public-web/open-next.config.ts`
- `apps/admin-web/open-next.config.ts`
- `apps/api/src/edge-worker.ts`

## 1) Prerequisites

1. Cloudflare account with zone `unykorn.org`.
2. API token with permissions:
   - Workers Scripts: Edit
   - Workers Routes: Edit
   - Queues: Edit
   - R2: Edit
   - Hyperdrive: Edit
   - Zone DNS: Edit
3. Wrangler CLI available via `npx wrangler`.

## 2) Provision Cloudflare Resources

Run in dashboard (or API/Terraform):

- Queues:
  - `doc-issuance-prod`
  - `doc-payments-prod`
  - `doc-ai-prod`
  - `doc-compliance-prod`
  - `doc-notify-prod`
- R2 bucket:
  - `doc-os-files-prod`
- OpenNext cache buckets:
  - `doc-web-cache-prod`
  - `doc-admin-cache-prod`
- Hyperdrive:
  - Create Hyperdrive target to production Postgres
  - Copy Hyperdrive ID into each `wrangler.jsonc`
- Durable Object classes:
  - `WalletSessionDO`, `ApprovalRoomDO`

## 3) Configure Secrets and Vars

Set API secrets:

```powershell
npx wrangler secret put JWT_SECRET -c cloudflare/api/wrangler.jsonc
npx wrangler secret put ANTHROPIC_API_KEY -c cloudflare/api/wrangler.jsonc
```

Optional web/admin secrets:

```powershell
npx wrangler secret put SENTRY_DSN -c cloudflare/doc-web/wrangler.jsonc
npx wrangler secret put SENTRY_DSN -c cloudflare/admin-web/wrangler.jsonc
```

## 4) Deploy in Order

Build the real Cloudflare web bundles first:

```powershell
pnpm cf:build
```

```powershell
# login
npx wrangler login

# deploy API first
npx wrangler deploy -c cloudflare/api/wrangler.jsonc

# deploy web
npx wrangler deploy -c cloudflare/doc-web/wrangler.jsonc

# deploy admin
npx wrangler deploy -c cloudflare/admin-web/wrangler.jsonc
```

or one command:

```powershell
powershell -ExecutionPolicy Bypass -File cloudflare/deploy.ps1
```

Current runtime split:

- `doc-web` and `doc-admin` deploy the real OpenNext-generated Cloudflare runtime.
- `doc-api` currently deploys the app-owned edge entry at `apps/api/src/edge-worker.ts`.
- Full Fastify route-surface conversion for API is still separate work.

## 5) Bind Custom Domains

Validate route bindings in each config:

- `doc.unykorn.org/*`
- `admin.doc.unykorn.org/*`
- `api.doc.unykorn.org/*`

Workers should be origin for these hostnames (Custom Domains model).

## 6) Zero Trust (Admin Lockdown)

Protect `admin.doc.unykorn.org`:

1. Cloudflare Zero Trust -> Access -> Applications -> Add application.
2. Type: Self-hosted.
3. Domain: `admin.doc.unykorn.org`.
4. Policies:
   - Allow: specific identity provider group(s)
   - Deny: everyone else
5. Session duration: short (for operator console)

## 7) WAF + Rate Limits

Enable:

- Managed Ruleset (Cloudflare WAF)
- Custom rules:
  - Rate limit `/auth/*`, `/ai/commands/*`, `/payments/*`, `/wallet/*/issue`
  - Block known bad signatures
  - Optional geo/ASN restrictions for admin/API

## 8) Post-Deploy Verification

Run these checks:

```powershell
curl https://api.doc.unykorn.org/health
curl https://doc.unykorn.org
curl -I https://admin.doc.unykorn.org
```

Expected:

- API health responds 200 JSON
- Public web responds 200
- Admin returns Access gate challenge unless authorized

Functional checks:

1. AI command plan request (`/ai/commands/execute` with `mode=plan`) returns authenticated response.
2. Issuance workflow enqueue creates queue message.
3. R2 upload + retrieval works for document artifacts.
4. Audit event written for command dispatch.
5. Web/admin pages render from the OpenNext runtime instead of the placeholder shell.

## 9) Rollback Plan

If deployment regresses:

```powershell
npx wrangler deployments list -c cloudflare/api/wrangler.jsonc
npx wrangler rollback <deployment-id> -c cloudflare/api/wrangler.jsonc
```

Repeat for web/admin workers.

## 10) Production Cutover Gate

Go-live only when all pass:

- Zero Trust enabled on admin
- WAF + rate limits active
- Hyperdrive connected and tested
- Queue + DO bindings valid
- R2 read/write verified
- Health and command execution stable
