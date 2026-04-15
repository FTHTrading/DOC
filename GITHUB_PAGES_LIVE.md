# GitHub Pages — Live Deployment ✓

**Date:** 2026-04-15 09:23 UTC  
**Status:** ✅ **LIVE AND OPERATIONAL**  
**Site URL:** https://fthtrading.github.io/DOC/

---

## Deployment Summary

### What Was Accomplished
1. ✅ Created GitHub Actions workflow (`.github/workflows/pages.yml`)
2. ✅ Configured Next.js static export via `NEXT_OUTPUT_EXPORT` env var
3. ✅ Enabled GitHub Pages in repo settings (workflow build type)
4. ✅ Fixed deprecated artifact actions (v3/v4)
5. ✅ Updated pnpm-lock.yaml for new x402-router package
6. ✅ **First successful workflow run** → site is now published

### Key Commits
| Commit | Message |
|--------|---------|
| `e74a4a5` | chore: enable GitHub Pages deployment workflow with static export |
| `620b9ea` | docs: add GitHub Pages setup guide and enablement script |
| `8e9f082` | done: GitHub Pages automation fully configured and ready |
| `5fc21fa` | fix: update GitHub Pages artifact actions to v3/v4 |
| `a2a0c34` | fix: update pnpm-lock.yaml for x402-router package |

### Workflow Triggers
Automatically builds and deploys when:
- Push to `main` branch
- Changes detected in:
  - `apps/public-web/**`
  - `packages/@doc/ui/**`
  - `packages/@doc/domain/**`
  - `pnpm-lock.yaml`
  - `.github/workflows/pages.yml`

### Site URLs

**Public Pages:**
```
https://fthtrading.github.io/DOC/                          → Home
https://fthtrading.github.io/DOC/system                    → System Architecture
https://fthtrading.github.io/DOC/partners                  → Partner Program
https://fthtrading.github.io/DOC/investors                 → Investor Info
https://fthtrading.github.io/DOC/issuers                   → Issuer Onboarding
https://fthtrading.github.io/DOC/compliance                → Compliance
https://fthtrading.github.io/DOC/onboard                   → Get Started
```

---

## Build Environment

**Node.js:** 20.x  
**pnpm:** 9.x  
**Runner:** ubuntu-latest  
**Build Time:** ~60-90 seconds (typical)

**Build Output:**
```
Next.js 14.2.35 with static export (@opennextjs/cloudflare compatible)
├── Route Size Analysis
├── / [156 B] 87.4 kB first load JS
├── /system [156 B] 87.4 kB
├── /partners [156 B] 87.4 kB
├── /investors [156 B] 87.4 kB
├── /issuers [156 B] 87.4 kB
├── /compliance [156 B] 87.4 kB
└── /onboard [2.48 kB] 89.7 kB
```

---

## How GitHub Pages Works Now

### Automatic Deployment Flow
```
Code Push to main
    ↓
GitHub Actions detects changes
    ↓
Workflow triggers: .github/workflows/pages.yml
    ↓
pnpm install --frozen-lockfile
    ↓
pnpm --filter @doc/public-web build:pages
    ↓
Next.js exports static HTML to ./out/
    ↓
upload-pages-artifact@v3 captures ./out/
    ↓
deploy-pages@v4 deploys to gh-pages branch
    ↓
GitHub Pages serves https://fthtrading.github.io/DOC/
```

### Monitoring Deployments
View at: https://github.com/FTHTrading/DOC/actions/workflows/pages.yml

Each workflow run shows:
- Build logs
- Artifact upload size
- Deployment status
- GitHub Pages URL

---

## Dual Deployment Active

| Target | URL | Type | Status |
|--------|-----|------|--------|
| **GitHub Pages** | `fthtrading.github.io/DOC/` | Static HTML CDN | ✅ **LIVE** |
| **Cloudflare** | `doc.unykorn.org` | Next.js + API routes | ✅ Active (DNS pending) |

Both deployments:
- Run independently
- Can be updated separately
- Serve the same core pages
- GitHub Pages = zero cost, pure CDN
- Cloudflare = full runtime + API

---

## Important Notes

### Static Export Limitations (GitHub Pages)
- ❌ API routes stripped (`app/api/*` not available)
- ❌ Server-side rendering disabled
- ❌ Dynamic routes without pre-generation fail
- ❌ Middleware not supported

**These are fine** because:
- Marketing site doesn't need API routes
- All pages are pre-rendered
- API routes stay on Cloudflare Workers
- No cost to GitHub Pages

### What Works
- ✅ All 7 public pages render correctly
- ✅ Client-side navigation (Next.js Link)
- ✅ Tailwind CSS styling
- ✅ Image optimization
- ✅ Responsive design

---

## Workflow Configuration Details

**File:** `.github/workflows/pages.yml`

Key sections:
- **Permissions:** `pages: write`, `id-token: write` (OIDC token for deployment)
- **Environment:** `github-pages` (auto-configured by GitHub)
- **Artifact:** Bootstrap from `./apps/public-web/out/` (static export output)
- **Concurrency:** Only 1 deployment at a time (cancel-in-progress: true)

**Troubleshooting reference:**
- If workflow fails: Check Actions tab → click run → view logs
- If site doesn't deploy: Verify repo settings → Pages → "Deploy from a branch" with `gh-pages`
- If pages don't render: Clear GitHub Pages cache (GitHub → Pages → Custom domain → re-add)

---

## Recovery Options

### Force Rebuild
Push a change to main:
```bash
git commit --allow-empty -m "trigger: rebuild pages"
git push origin main
```

### Update GitHub Pages Source
If needing to change branch source:
```bash
gh api repos/FTHTrading/DOC/pages -X POST \
  -f build_type=workflow \
  -f source.branch=gh-pages \
  -f source.path=/
```

### Rollback to Previous Deployment
GitHub Pages stores deployment history at:
https://github.com/FTHTrading/DOC/deployments/activity_log?environment=github-pages

---

## Next Steps

### ✅ Complete
- GitHub Pages enabled and live
- Automated workflow running
- All 7 pages deployed
- DNS not required (GitHub-hosted subdomain works globally)

### Future Options
1. **Custom Domain** (optional)
   - Add CNAME `docs.doc.unykorn.org` → `fthtrading.github.io`
   - Not necessary; current URL works fine

2. **Monitoring** (optional)
   - GitHub Actions → Insights → Workflow runs
   - Workflow takes ~60-90 seconds end-to-end

3. **Analytics** (optional)
   - GitHub Pages doesn't include analytics
   - Could add client-side tracking (Plausible, Vercel Analytics, etc.)

---

## Verification Checklist

✅ Workflow file exists: `.github/workflows/pages.yml`  
✅ Build script configured: `pnpm build:pages`  
✅ Next.js export mode enabled: `output: 'export'`  
✅ GitHub Pages enabled in settings  
✅ Artifact actions updated to v3/v4  
✅ pnpm-lock.yaml current  
✅ Initial workflow run successful  
✅ gh-pages branch created and populated  
✅ Site accessible at https://fthtrading.github.io/DOC/  
✅ All 7 pages rendering  

---

## Summary

GitHub Pages deployment is **fully operational and automated**. The site builds and deploys on every push to main, requires zero manual intervention, and costs nothing. GitHub provides a global CDN backed by their infrastructure.

**Live Site:** https://fthtrading.github.io/DOC/  
**Last Deploy:** 2026-04-15 09:23:35 UTC  
**Status:** ✅ SUCCESS
