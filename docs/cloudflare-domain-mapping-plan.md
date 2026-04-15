# Cloudflare Domain Mapping Plan (DOC OS)

## Objective

Deploy DOC OS as a Cloudflare-native financial operating surface with strict separation between public, admin, and API planes.

## Zone

- Primary zone: `unykorn.org`

## Production Hostnames

- `doc.unykorn.org` -> Worker: `doc-web`
- `admin.doc.unykorn.org` -> Worker: `doc-admin`
- `api.doc.unykorn.org` -> Worker: `doc-api`
- Optional live state endpoint: `ws.doc.unykorn.org` -> Worker route in `doc-api` or dedicated `doc-ws`

## Control Plane Services

- Durable Objects:
  - Wallet session state
  - Approval rooms
  - Deal rooms
  - Command execution rooms
- Queues:
  - `doc-issuance-prod`
  - `doc-payments-prod`
  - `doc-ai-prod`
  - `doc-compliance-prod`
  - `doc-notify-prod`
- Workflows:
  - issuance chain
  - onboarding chain
  - approval chain
  - payout chain
- R2:
  - `doc-os-files-prod`
- Hyperdrive:
  - binding `DOC_DB` to production Postgres

## Security Topology

- Zero Trust Access protect:
  - `admin.doc.unykorn.org`
  - internal operator/API paths
- WAF managed rules on:
  - all hostnames
- WAF custom rules:
  - strict rate limits for auth, issuance, AI command, payments
  - geo/ASN restrictions for admin paths if required

## DNS and Route Sequence

1. Verify zone + SSL in Cloudflare dashboard.
2. Deploy worker `doc-web` and attach route `doc.unykorn.org/*`.
3. Deploy worker `doc-admin` and attach route `admin.doc.unykorn.org/*`.
4. Deploy worker `doc-api` and attach route `api.doc.unykorn.org/*`.
5. Enable Access policies on admin hostname.
6. Enable WAF managed rules + custom rules.
7. Run smoke tests:
   - public load
   - admin access challenge
   - API health/auth/rate-limit

## Wrangler Files

Use templates in:

- `cloudflare/wrangler.doc-web.toml`
- `cloudflare/wrangler.admin-web.toml`
- `cloudflare/wrangler.api.toml`

Replace placeholders before deploy:

- `<HYPERDRIVE_ID>`
- R2 bucket names if environment differs
- JWT and environment vars

## Deploy Commands (example)

```powershell
# auth (requires CLOUDFLARE_API_TOKEN)
wrangler whoami

# deploy web
wrangler deploy --config cloudflare/wrangler.doc-web.toml

# deploy admin
wrangler deploy --config cloudflare/wrangler.admin-web.toml

# deploy api
wrangler deploy --config cloudflare/wrangler.api.toml
```

## Operator Acceptance Checklist

- `https://doc.unykorn.org` loads and renders command-center shell
- `https://admin.doc.unykorn.org` requires Zero Trust identity
- `https://api.doc.unykorn.org/health` returns healthy response
- issuance queue receives messages from API actions
- approval and command Durable Objects keep ordered state
- uploads persist in R2 and audit links are stored
