# GitHub Pages Setup — DOC Repository

## Status: ✅ Workflow Configured  
Commit: **e74a4a5** — GitHub Pages deployment automation is now live in the repository.

## What Was Deployed
1. **`.github/workflows/pages.yml`** — GitHub Actions workflow
   - Triggers automatically on push to main
   - Builds Next.js site with static export (`NEXT_OUTPUT_EXPORT=true`)
   - Deploys to `gh-pages` branch
   - Filters: Only rebuilds on changes to `apps/public-web/`, `packages/@doc/`, `pnpm-lock.yaml`, or workflows

2. **`apps/public-web/next.config.mjs`** — Static export support
   - Conditionally enables `output: 'export'` via env var
   - Preserves Cloudflare Worker build (`build:cf`) functionality

3. **`apps/public-web/package.json`** — New build script
   - `build:pages`: Triggers static export for GitHub Pages

4. **`.nojekyll`** — Prevents Jekyll processing
   - Required for modern GitHub Pages with dynamic routing

## Next Steps: Enable in GitHub UI (One-Time Setup)

### Option A: Web UI (Recommended for First-Time)
1. Go to: **https://github.com/FTHTrading/DOC/settings/pages**
2. Under **"Build and deployment"**:
   - Source: Select **"Deploy from a branch"**
   - Branch: Select **`gh-pages`** from dropdown
   - Folder: `/` (root)
3. Click **Save**
4. GitHub will monitor the `gh-pages` branch (created by the workflow on first push)

### Option B: PowerShell (Programmatic)
```powershell
$env:GITHUB_TOKEN = "your_github_token_here"
.\scripts\enable-github-pages.ps1 -Owner "FTHTrading" -Repo "DOC"
```
Requires a GitHub PAT with `repo` scope.

### Option C: Manual API Call (curl/http)
```bash
curl -X POST https://api.github.com/repos/FTHTrading/DOC/pages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"source":{"branch":"gh-pages","path":"/"},"build_type":"workflow"}'
```

## Expected Workflow Execution

### First Push After Setup
1. Code is pushed to `main`
2. GitHub Actions detects change in `apps/public-web/`
3. Workflow runs: `pnpm install` → `pnpm --filter @doc/public-web build:pages`
4. Static HTML generated in `apps/public-web/out/`
5. Artifact uploaded to `gh-pages` branch
6. GitHub Pages serves from `https://fthtrading.github.io/DOC/`

### Page Routes Available
```
https://fthtrading.github.io/DOC/                      → Home
https://fthtrading.github.io/DOC/system                → System Architecture
https://fthtrading.github.io/DOC/partners              → Partner Program
https://fthtrading.github.io/DOC/investors             → Investor Info
https://fthtrading.github.io/DOC/issuers               → Issuer Onboarding
https://fthtrading.github.io/DOC/compliance            → Compliance
https://fthtrading.github.io/DOC/onboard               → Get Started
```

## Important Notes

### Static Export Limitations
**What is stripped in `export` mode:**
- API routes (`app/api/` routes are removed)
- Server-side rendering (getServerSideProps equivalent)
- Dynamic routes without pregeneration
- Middleware

**What works:**
- Static pages (all 7 pages in DOC)
- Client-side navigation (Next.js Link, useRouter)
- Image optimization (becomes static assets)
- Styling (Tailwind CSS)

### Dual Deployment Strategy
- **GitHub Pages** (`https://fthtrading.github.io/DOC/`) — Pure static marketing site (SEO-friendly, fast CDN)
- **Cloudflare Workers** (`doc.unykorn.org`, `api.unykorn.org`) — Full Next.js runtime with API routes (dynamic, real-time)

Both can run simultaneously. GitHub Pages is a no-code, no-cost backup for the public site.

### Monitoring Deployments
1. **Actions tab:** https://github.com/FTHTrading/DOC/actions/workflows/pages.yml
   - Shows build logs, artifacts, deployment status
   - Auto-trigger on main push (if Pages is enabled)

2. **GitHub Pages settings:** https://github.com/FTHTrading/DOC/settings/pages
   - Shows active deployment status, last published date
   - Allows rollback to previous deployments

## Troubleshooting

### Workflow runs but site doesn't appear
- **Cause:** Pages not enabled in settings
- **Fix:** Complete "Enable in GitHub UI" step above

### Build fails with "export is not valid"
- **Cause:** NEXT_OUTPUT_EXPORT env var not set in workflow
- **Fix:** Already set in `.github/workflows/pages.yml` (lines 56-57) — workflow may need to run once more

### Images missing or broken links
- **Cause:** Relative imports in static export mode
- **Fix:** Ensure all image paths are absolute or use `@/` alias imports

### Site publishes but navigation broken
- **Cause:** Client-side routing with `Link` component
- **Fix:** This should work with Next.js export; check browser console for errors

## Commands for Local Testing

Build locally with static export:
```bash
cd apps/public-web
NEXT_OUTPUT_EXPORT=true pnpm build
# Output: out/
```

Serve locally to test:
```bash
pnpm dlx http-server apps/public-web/out -p 8000 -o /DOC
```

## Summary
✅ Automation is **ready**. Just enable Pages in GitHub settings, and the workflow will auto-deploy on each push to main.
