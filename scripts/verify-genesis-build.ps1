param(
  [string]$RepoRoot = "."
)

$ErrorActionPreference = "Stop"
Set-Location $RepoRoot

$requiredPaths = @(
  "apps/genesis-web",
  "apps/genesis-mobile",
  "apps/genesis-extension",
  "apps/wallet-api",
  "apps/fth-pay-router",
  "apps/signer-orchestrator",
  "packages/wallet-core",
  "packages/fth-pay",
  "packages/device-registry",
  "packages/policy-engine",
  "packages/ai-wallet-agent",
  "packages/chain-adapters",
  "packages/contacts",
  "packages/notifications"
)

$missing = @()
foreach ($p in $requiredPaths) {
  if (-not (Test-Path $p)) {
    $missing += $p
  }
}

Write-Host "== Genesis Build Verification ==" -ForegroundColor Cyan
Write-Host "Required paths checked: $($requiredPaths.Count)"

if ($missing.Count -gt 0) {
  Write-Host "Missing paths:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "All required apps/packages exist." -ForegroundColor Green

# Optional deeper checks
$requiredFiles = @(
  "apps/wallet-api/package.json",
  "apps/genesis-web/package.json",
  "apps/genesis-extension/package.json",
  "apps/genesis-mobile/package.json",
  "packages/wallet-core/package.json",
  "packages/ai-wallet-agent/package.json"
)

$fileMissing = @()
foreach ($f in $requiredFiles) {
  if (-not (Test-Path $f)) {
    $fileMissing += $f
  }
}

if ($fileMissing.Count -gt 0) {
  Write-Host "Missing key package manifests:" -ForegroundColor Yellow
  $fileMissing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
  exit 2
}

Write-Host "Key manifests found." -ForegroundColor Green
Write-Host "Genesis scaffold verification PASSED." -ForegroundColor Green
exit 0
