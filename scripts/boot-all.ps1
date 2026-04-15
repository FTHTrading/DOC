param(
  [string]$RepoRoot = ".",
  [switch]$SkipInstall,
  [switch]$SkipDocker
)

$ErrorActionPreference = "Stop"
Set-Location $RepoRoot

function Get-FreePort {
  param([int[]]$Candidates)
  foreach ($p in $Candidates) {
    $inUse = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if (-not $inUse) { return $p }
  }
  throw "No free port in candidate list: $($Candidates -join ', ')"
}

function Get-PortSelection {
  param([int[]]$Candidates)
  foreach ($p in $Candidates) {
    $inUse = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if (-not $inUse) { return @{ Port = $p; IsFree = $true } }
  }
  return @{ Port = $Candidates[0]; IsFree = $false }
}

function Test-PortOpen {
  param([string]$HostName, [int]$Port)
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($HostName, $Port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(500)
    $client.Close()
    return $ok
  } catch {
    return $false
  }
}

function Start-ServiceProcess {
  param(
    [string]$Name,
    [string]$Command,
    [string]$RepoPath
  )

  if (-not (Test-Path ".logs")) { New-Item -Path ".logs" -ItemType Directory | Out-Null }
  $outLog = ".logs/$Name.out.log"
  $errLog = ".logs/$Name.err.log"

  $psCommand = "Set-Location '$RepoPath'; $Command"

  $proc = Start-Process -FilePath "powershell" `
    -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $psCommand) `
    -PassThru `
    -WindowStyle Hidden `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog

  return [pscustomobject]@{
    Name = $Name
    Process = $proc
    OutLog = $outLog
    ErrLog = $errLog
  }
}

$apiPort = Get-FreePort -Candidates @(4000, 4010, 4020)
$publicPort = Get-FreePort -Candidates @(3000, 3010, 3020)
$adminPort = Get-FreePort -Candidates @(3001, 3011, 3021)
$dbSelection = Get-PortSelection -Candidates @(5432, 5433, 15432)
$redisSelection = Get-PortSelection -Candidates @(6379, 6380, 16379)
$dbPort = $dbSelection.Port
$redisPort = $redisSelection.Port

$databaseUrl = "postgresql://doc:doc_local_dev@localhost:$dbPort/doc"
$redisUrl = "redis://localhost:$redisPort"
$jwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "doc_local_dev_jwt_secret_change_me" }
$corsOrigins = "http://localhost:$publicPort,http://localhost:$adminPort"

$envFile = ".env.runtime.ports"
@(
  "PORT=$apiPort",
  "PUBLIC_PORT=$publicPort",
  "ADMIN_PORT=$adminPort",
  "DOC_DB_PORT=$dbPort",
  "DOC_REDIS_PORT=$redisPort",
  "DATABASE_URL=$databaseUrl",
  "REDIS_URL=$redisUrl",
  "JWT_SECRET=$jwtSecret",
  "CORS_ORIGINS=$corsOrigins",
  "NEXT_PUBLIC_API_URL=http://localhost:$apiPort"
) | Set-Content -Path $envFile

Write-Host "== DOC One-Command Boot ==" -ForegroundColor Magenta
Write-Host "API:       http://localhost:$apiPort"
Write-Host "Public:    http://localhost:$publicPort"
Write-Host "Admin:     http://localhost:$adminPort"
Write-Host "Postgres:  localhost:$dbPort"
Write-Host "Redis:     localhost:$redisPort"
Write-Host "Runtime env written to $envFile"

if (-not $SkipInstall) {
  Write-Host "Installing dependencies..." -ForegroundColor Yellow
  pnpm install
} elseif (-not (Test-Path "node_modules")) {
  Write-Host "-SkipInstall was set but node_modules is missing. Running pnpm install once." -ForegroundColor Yellow
  pnpm install
}

$prismaClientPath = "node_modules/.prisma/client/default.js"
if (-not (Test-Path $prismaClientPath)) {
  Write-Host "Prisma client not found. Generating with pnpm db:generate..." -ForegroundColor Yellow
  pnpm db:generate
}

if (-not $SkipDocker -and (-not $dbSelection.IsFree -or -not $redisSelection.IsFree)) {
  Write-Host "DB/Redis candidate ports are in use. Skipping docker compose and reusing existing services." -ForegroundColor Yellow
  $SkipDocker = $true
}

if (-not $SkipDocker) {
  Write-Host "Starting Docker services (Postgres + Redis)..." -ForegroundColor Yellow
  $env:DOC_DB_PORT = "$dbPort"
  $env:DOC_REDIS_PORT = "$redisPort"
  try {
    docker compose up -d
  } catch {
    Write-Host "Docker startup failed. Continuing with existing services." -ForegroundColor Yellow
  }
}

$root = (Get-Location).Path

$apiCmd = "`$env:PORT='{0}'; `$env:DATABASE_URL='{1}'; `$env:REDIS_URL='{2}'; `$env:JWT_SECRET='{3}'; `$env:CORS_ORIGINS='{4}'; pnpm --filter @doc/api dev" -f $apiPort, $databaseUrl, $redisUrl, $jwtSecret, $corsOrigins
$publicCmd = "`$env:NEXT_PUBLIC_API_URL='http://localhost:{0}'; pnpm --filter @doc/public-web exec next dev -p {1}" -f $apiPort, $publicPort
$adminCmd = "`$env:NEXT_PUBLIC_API_URL='http://localhost:{0}'; pnpm --filter @doc/admin-web exec next dev -p {1}" -f $apiPort, $adminPort
$orchestratorCmd = "`$env:DATABASE_URL='{0}'; `$env:REDIS_URL='{1}'; pnpm --filter @doc/orchestrator dev" -f $databaseUrl, $redisUrl
$workerCmd = "`$env:DATABASE_URL='{0}'; `$env:REDIS_URL='{1}'; pnpm --filter @doc/worker dev" -f $databaseUrl, $redisUrl

$services = @()
$services += Start-ServiceProcess -Name "api" -Command $apiCmd -RepoPath $root
$services += Start-ServiceProcess -Name "public-web" -Command $publicCmd -RepoPath $root
$services += Start-ServiceProcess -Name "admin-web" -Command $adminCmd -RepoPath $root
$services += Start-ServiceProcess -Name "orchestrator" -Command $orchestratorCmd -RepoPath $root
$services += Start-ServiceProcess -Name "worker" -Command $workerCmd -RepoPath $root

Write-Host "Services launched as background processes. Press Ctrl+C to stop and clean up." -ForegroundColor Green

try {
  while ($true) {
    Start-Sleep -Seconds 3

    $apiOk = $false
    try {
      $resp = Invoke-RestMethod -Uri "http://localhost:$apiPort/health" -Method GET -TimeoutSec 2
      if ($resp.ok -eq $true -or $resp.status -eq "ok") { $apiOk = $true }
    } catch {}

    $publicOpen = Test-PortOpen -HostName "127.0.0.1" -Port $publicPort
    $adminOpen = Test-PortOpen -HostName "127.0.0.1" -Port $adminPort
    $dbOpen = Test-PortOpen -HostName "127.0.0.1" -Port $dbPort
    $redisOpen = Test-PortOpen -HostName "127.0.0.1" -Port $redisPort

    Clear-Host
    Write-Host "== DOC Live Health Dashboard ==" -ForegroundColor Magenta

    Write-Host "API /health: " -NoNewline
    if ($apiOk) { Write-Host "UP" -ForegroundColor Green } else { Write-Host "DOWN" -ForegroundColor Red }

    Write-Host "Public Web:  " -NoNewline
    if ($publicOpen) { Write-Host "UP" -ForegroundColor Green } else { Write-Host "DOWN" -ForegroundColor Red }

    Write-Host "Admin Web:   " -NoNewline
    if ($adminOpen) { Write-Host "UP" -ForegroundColor Green } else { Write-Host "DOWN" -ForegroundColor Red }

    Write-Host "Postgres:    " -NoNewline
    if ($dbOpen) { Write-Host "UP" -ForegroundColor Green } else { Write-Host "DOWN" -ForegroundColor Red }

    Write-Host "Redis:       " -NoNewline
    if ($redisOpen) { Write-Host "UP" -ForegroundColor Green } else { Write-Host "DOWN" -ForegroundColor Red }

    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Cyan
    Write-Host "  API:    http://localhost:$apiPort/health"
    Write-Host "  Public: http://localhost:$publicPort"
    Write-Host "  Admin:  http://localhost:$adminPort"

    Write-Host ""
    Write-Host "Processes:" -ForegroundColor Cyan
    foreach ($svc in $services) {
      $state = if ($svc.Process.HasExited) { "Exited" } else { "Running" }
      Write-Host ("  {0,-14} {1} (PID {2})" -f $svc.Name, $state, $svc.Process.Id)
    }

    Write-Host ""
    Write-Host "Logs: .logs/<service>.out.log and .logs/<service>.err.log" -ForegroundColor DarkGray
  }
}
finally {
  Write-Host "Stopping background processes..." -ForegroundColor Yellow
  foreach ($svc in $services) {
    try {
      if (-not $svc.Process.HasExited) {
        Stop-Process -Id $svc.Process.Id -Force
      }
    } catch {}
  }
}