param(
  [int]$ApiPort = 4000,
  [int]$PublicPort = 3000,
  [int]$AdminPort = 3001,
  [int]$DbPort = 5432,
  [int]$RedisPort = 6379,
  [int]$IntervalSeconds = 3
)

$ErrorActionPreference = "SilentlyContinue"

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

while ($true) {
  Clear-Host
  Write-Host "== DOC Health Dashboard ==" -ForegroundColor Magenta

  $apiOk = $false
  try {
    $resp = Invoke-RestMethod -Uri "http://localhost:$ApiPort/health" -Method GET -TimeoutSec 2
    if ($resp.ok -eq $true -or $resp.status -eq "ok") { $apiOk = $true }
  } catch {}

  $publicOpen = Test-PortOpen -HostName "127.0.0.1" -Port $PublicPort
  $adminOpen = Test-PortOpen -HostName "127.0.0.1" -Port $AdminPort
  $dbOpen = Test-PortOpen -HostName "127.0.0.1" -Port $DbPort
  $redisOpen = Test-PortOpen -HostName "127.0.0.1" -Port $RedisPort

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
  Write-Host "  http://localhost:$ApiPort/health"
  Write-Host "  http://localhost:$PublicPort"
  Write-Host "  http://localhost:$AdminPort"

  Start-Sleep -Seconds $IntervalSeconds
}