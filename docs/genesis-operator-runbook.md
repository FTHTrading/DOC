# Genesis Operator Runbook

## Purpose

Run the master build prompt, verify scaffold output, and validate the first internal issuance + AI workflow.

## 0) Token and Domain Note

For Cloudflare deploy operations related to doc.unykorn.org, use the **Workers-edit token** (the 3rd token from your token file list).

Reference source noted by operator:
- C:\Users\Kevan\OneDrive - FTH Trading\11-Downloads\Workers AI API token was successful - Copy.txt

Recommended env vars during deploy:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_ZONE_ID (doc.unykorn.org zone)

## 1) Run the Master Build Prompt

1. Open DOC repo in VS Code.
2. Open Copilot Chat in Agent mode.
3. Paste full contents of:
   - docs/master-vscode-prompt-genesis-wallet.md
4. Execute.

## 1.5) One-Command Runtime Boot (recommended)

From repo root run:

```powershell
pnpm boot:all
```

What it does:
- auto-detects free ports (API: 4000/4010/4020, Public: 3000/3010/3020, Admin: 3001/3011/3021)
- writes selected ports to `.env.runtime.ports`
- runs `pnpm install`
- runs `docker compose up -d`
- starts API, Public Web, Admin Web, Orchestrator, and Worker as background jobs
- renders a live health dashboard in terminal

If dependencies are already installed and docker is already up:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/boot-all.ps1 -SkipInstall -SkipDocker
```

## 2) Verify Required Build Output

Run:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/verify-genesis-build.ps1
```

Expected result:
- exit code 0
- "Genesis scaffold verification PASSED."

## 3) Start Services

Use your generated app start commands.
At minimum ensure these are up:
- wallet-api
- fth-pay-router
- signer-orchestrator
- genesis-web

For DOC current stack, live monitor can be run separately:

```powershell
pnpm health:dashboard
```

## 4) Validate First Issuance Flow

Run smoke test (adjust API base and token):

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/smoke-test-issuance.ps1 -ApiBase "http://localhost:4010" -AuthToken "<token>"
```

Expected sequence:
1. identity created
2. wallet issued in INTERNAL_ONLY
3. internal funding transaction created
4. transfer request created with approval path
5. AI command run created for batch investor wallet issuance

## 5) Critical AI Test

In Genesis AI command bar run:

Create 2 investor wallets and enable FTH Pay

Success criteria:
- wallets created
- participants/identities linked
- permissions set
- audit records written

## 6) Stop Conditions (Fix Immediately)

Stop and correct if any occur:
- generated app/package names diverge from required structure
- wallet defaults are not INTERNAL_ONLY
- external rails are used before internal routing check
- AI command execution writes no audit trail

## 7) Definition of Real

System is considered real when this passes:

Doc issues wallet
-> wallet appears
-> identity created
-> permissions set
-> internal balance assigned
-> send internal transfer
-> approval triggers
-> transaction logs
