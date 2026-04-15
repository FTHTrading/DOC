#!/usr/bin/env pwsh
# Enable GitHub Pages for DOC repo via GitHub API

param(
    [string]$GitHubToken = $env:GITHUB_TOKEN,
    [string]$Owner = "FTHTrading",
    [string]$Repo = "DOC"
)

if (-not $GitHubToken) {
    Write-Host "ERROR: GITHUB_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Generate a token at https://github.com/settings/tokens with 'repo' scope"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $GitHubToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
    source = @{
        branch = "gh-pages"
        path   = "/"
    }
    build_type = "workflow"
} | ConvertTo-Json

$uri = "https://api.github.com/repos/$Owner/$Repo/pages"

Write-Host "Enabling GitHub Pages for $Owner/$Repo..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✓ GitHub Pages enabled!" -ForegroundColor Green
    Write-Host "  Branch: $($response.source.branch)"
    Write-Host "  Path: $($response.source.path)"
    Write-Host "  Status: $($response.status)"
    Write-Host ""
    Write-Host "Site will be available at: https://$Owner.github.io/$Repo/" -ForegroundColor Cyan
    Write-Host "Workflow will run on next push to main and create the gh-pages branch."
} catch {
    $errorDetail = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetail.message -like "*already*") {
        Write-Host "✓ GitHub Pages already enabled" -ForegroundColor Yellow
        Write-Host "  Message: $($errorDetail.message)"
    } else {
        Write-Host "ERROR: Failed to enable Pages" -ForegroundColor Red
        Write-Host "  Status: $($_.Exception.Response.StatusCode)"
        Write-Host "  Message: $($errorDetail.message)"
        exit 1
    }
}
