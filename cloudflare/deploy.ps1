param(
  [switch]$SkipBuild,
  [switch]$SkipAuthCheck
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

function Invoke-Step($label, [scriptblock]$action) {
  Write-Host $label -ForegroundColor Cyan
  & $action
  if ($LASTEXITCODE -ne 0) {
    throw "$label failed with exit code $LASTEXITCODE"
  }
}

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $name"
  }
}

Assert-Command "npx"
Assert-Command "pnpm"

if (-not $SkipAuthCheck) {
  Invoke-Step "Checking Wrangler authentication..." { npx wrangler whoami }
}

if (-not $SkipBuild) {
  Invoke-Step "Building DOC Web for Cloudflare..." { pnpm --filter @doc/public-web build:cf }
  Invoke-Step "Building Admin Web for Cloudflare..." { pnpm --filter @doc/admin-web build:cf }
}

Invoke-Step "Deploying API Worker..." { npx wrangler deploy -c cloudflare/api/wrangler.jsonc }

Invoke-Step "Deploying DOC Web Worker..." { npx wrangler deploy -c cloudflare/doc-web/wrangler.jsonc }

Invoke-Step "Deploying Admin Worker..." { npx wrangler deploy -c cloudflare/admin-web/wrangler.jsonc }

Write-Host "\nDeployment complete." -ForegroundColor Green
Write-Host "Next manual steps:" -ForegroundColor Yellow
Write-Host "1) Verify custom domain bindings in Cloudflare dashboard"
Write-Host "2) Enable Zero Trust Access for admin.doc.unykorn.org"
Write-Host "3) Enable WAF managed rules + custom rate limits"
Write-Host "4) Run post-deploy checks in docs/cloudflare-exact-deploy-pack.md"
