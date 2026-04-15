param(
  [string]$ApiBase = "http://localhost:4010",
  [string]$AuthToken = "",
  [string]$Role = "BROKER_DEALER",
  [string]$WalletClass = "BROKER_DEALER"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )

  $headers = @{ "Content-Type" = "application/json" }
  if ($AuthToken -ne "") {
    $headers["Authorization"] = "Bearer $AuthToken"
  }

  $uri = "$ApiBase$Path"

  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
  }

  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body ($Body | ConvertTo-Json -Depth 8)
}

Write-Host "== Wallet Issuance Smoke Test ==" -ForegroundColor Cyan
Write-Host "Target API: $ApiBase"

# 1) Create participant identity (expected endpoint after build)
$stamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "lisa.carter.$stamp@example.com"

$identityReq = @{
  name = "Lisa Carter"
  email = $email
  role = $Role
  namespaceHint = "lisa-carter"
}

Write-Host "1/5 Creating identity..."
$identity = Invoke-Api -Method "POST" -Path "/wallet/identities" -Body $identityReq
if (-not $identity.id) { throw "Identity creation failed: no id returned" }

# 2) Issue wallet internal-only with FTH Pay enabled
$issueReq = @{
  identityId = $identity.id
  walletClass = $WalletClass
  state = "INTERNAL_ONLY"
  fthPayEnabled = $true
  limits = @{ dailyUsd = 50000; txUsd = 10000 }
}

Write-Host "2/5 Issuing wallet..."
$wallet = Invoke-Api -Method "POST" -Path "/wallet/issue" -Body $issueReq
if (-not $wallet.walletId) { throw "Wallet issuance failed: no walletId returned" }

# 3) Assign internal starting balance
$fundReq = @{
  walletId = $wallet.walletId
  asset = "USDF"
  amount = "250000000" # 250.0000000 with 7dp style
  reason = "smoke-test-initial-funding"
}

Write-Host "3/5 Funding internal wallet..."
$fund = Invoke-Api -Method "POST" -Path "/fth-pay/internal/fund" -Body $fundReq
if (-not $fund.txId) { throw "Funding failed: no txId returned" }

# 4) Trigger controlled internal transfer with approval path
$transferReq = @{
  fromWalletId = $wallet.walletId
  toCounterparty = "treasury-main"
  asset = "USDF"
  amount = "50000000" # 50.0000000
  route = "INTERNAL"
  requireApproval = $true
}

Write-Host "4/5 Creating transfer request..."
$transfer = Invoke-Api -Method "POST" -Path "/fth-pay/transfers/request" -Body $transferReq
if (-not $transfer.requestId) { throw "Transfer request failed: no requestId returned" }

# 5) Ask AI command endpoint to batch issue two investor wallets
$cmdReq = @{
  command = "Create 2 investor wallets and enable FTH Pay"
  mode = "execute"
  actorWalletId = $wallet.walletId
}

Write-Host "5/5 Running AI issuance command..."
$cmd = Invoke-Api -Method "POST" -Path "/wallet/commands/execute" -Body $cmdReq
if (-not $cmd.commandRunId) { throw "AI command execution failed: no commandRunId returned" }

Write-Host "Smoke test complete." -ForegroundColor Green
Write-Host "Identity: $($identity.id)"
Write-Host "Wallet:   $($wallet.walletId)"
Write-Host "Fund Tx:  $($fund.txId)"
Write-Host "Transfer: $($transfer.requestId)"
Write-Host "AI Run:   $($cmd.commandRunId)"

exit 0
