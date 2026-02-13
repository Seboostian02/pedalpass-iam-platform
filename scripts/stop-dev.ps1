# =============================================
# IAM Platform - Stop Development Environment
# =============================================
# Usage: .\scripts\stop-dev.ps1
# Options:
#   -RemoveVolumes   Also remove Docker volumes (databases, pgAdmin data, etc.)

param(
    [switch]$RemoveVolumes
)

$ErrorActionPreference = "Stop"

# Always run from project root (parent of scripts/)
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IAM Platform - Stop Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill Vite dev server (npm run dev) if running on port 5173
$viteProc = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($viteProc) {
    foreach ($procId in $viteProc) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -eq "node") {
            Write-Host "  Stopping Vite dev server (PID: $procId)..." -ForegroundColor Yellow
            Stop-Process -Id $procId -Force
        }
    }
}

if ($RemoveVolumes) {
    Write-Host "Stopping all containers and removing volumes..." -ForegroundColor Yellow
    docker compose --env-file .env down -v
    Write-Host ""
    Write-Host "  [OK] All containers stopped + volumes removed" -ForegroundColor Green
    Write-Host "  [INFO] Databases, pgAdmin data, RabbitMQ data wiped." -ForegroundColor Yellow
    Write-Host "  [INFO] Next start will recreate everything from scratch." -ForegroundColor Yellow
} else {
    Write-Host "Stopping all containers..." -ForegroundColor Yellow
    docker compose --env-file .env down
    Write-Host ""
    Write-Host "  [OK] All containers stopped (volumes preserved)" -ForegroundColor Green
}

Write-Host ""
Write-Host "To start again:" -ForegroundColor Cyan
Write-Host "  .\scripts\start-dev.ps1              # Start everything" -ForegroundColor White
Write-Host "  .\scripts\start-dev.ps1 -InfraOnly   # Start only infrastructure" -ForegroundColor White
Write-Host ""

Pop-Location
