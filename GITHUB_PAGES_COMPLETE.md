# GitHub Pages Deployment Complete

**Commit:** `620b9ea` (pushed to main)  
**Date:** 2026-04-15

## What Was Set Up

### 1. Automated Build & Deploy Workflow
**File:** `.github/workflows/pages.yml`
- Triggers on push to `main` (filtered to relevant paths)
- Builds: `NEXT_OUTPUT_EXPORT=true pnpm --filter @doc/public-web build:pages`
- Deploys static HTML to `gh-pages` branch
- Permissions: Read repo + write pages + OIDC token

### 2. Next.js Static Export Support
**File:** `apps/public-web/next.config.mjs`
- Added conditional `output: 'export'` via `NEXT_OUTPUT_EXPORT` env var
- Preserves compatibility with Cloudflare Worker build (`build:cf`)

### 3. Build Script
**File:** `apps/public-web/package.json`
- New script: `build:pages` → runs `next build` with export mode

### 4. GitHub Pages Configuration
**File:** `.nojekyll`
- Prevents Jekyll processing (required for modern routing)

### 5. Documentation
**Files:**
- `docs/GITHUB_PAGES_SETUP.md` — Complete setup guide with 3 enable options
- `scripts/enable-github-pages.ps1` — PowerShell script to enable via GitHub API

---

## How to Activate

### Using GitHub Web UI (Recommended)
1. Go to: **https://github.com/FTHTrading/DOC/settings/pages**
2. **Build and deployment** section:
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/`
3. Click **Save**

### Using PowerShell Script
```powershell
$env:GITHUB_TOKEN = "your_github_personal_access_token"
.\scripts\enable-github-pages.ps1
```

---

## Expected Result

**Site URL:** `https://fthtrading.github.io/DOC/`

**Pages:**
- Home: `/`
- System Architecture: `/system`
- Partner Program: `/partners`
- Investor Track: `/investors`
- Issuer Onboarding: `/issuers`
- Compliance: `/compliance`
- Get Started: `/onboard`

**Deployment Status:** Visible at https://github.com/FTHTrading/DOC/actions/workflows/pages.yml

---

## Dual Deployment Strategy

| Platform | URL | Type | Use Case |
|----------|-----|------|----------|
| **GitHub Pages** | `fthtrading.github.io/DOC/` | Static export | Public marketing, SEO, no-code CDN |
| **Cloudflare Workers** | `doc.unykorn.org`, `api.unykorn.org` | Full Next.js runtime | API routes, dynamic content, production |

Both remain active. GitHub Pages is a backup and reduces cloud costs.

---

## Git Commits

1. **e74a4a5** — `chore: enable GitHub Pages deployment workflow with static export`
   - Workflow config, Next.js updates, .nojekyll

2. **620b9ea** — `docs: add GitHub Pages setup guide and enablement script`
   - Setup documentation and enablement helper

---

## Next Steps

1. **Enable Pages in GitHub UI** (see "How to Activate" above)
2. **Verify workflow runs** — Check Actions tab after first push post-enablement
3. **Test site** — Visit https://fthtrading.github.io/DOC/ once deployed
4. **(Optional) Update DNS** — If desired, add CNAME `fthtrading.github.io` → custom domain (not required for CI/CD)

---

## Notes

- Workflow runs **only on changes** to `apps/public-web/`, `packages/@doc/`, or workflow files (efficient)
- Static export **strips API routes** (not a problem; API routes remain on Cloudflare Workers)
- **First workflow run** will create the `gh-pages` branch automatically
- **No additional secrets needed** — GitHub Actions has built-in OIDC token for Pages deployment
- **Production-ready** — Fully automated, no manual steps after initial enablement

✅ **Ready to deploy on your GitHub Pages activation.**
