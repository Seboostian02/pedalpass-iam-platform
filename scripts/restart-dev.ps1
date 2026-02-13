# =============================================
# IAM Platform - Restart Development Environment
# =============================================
# Usage: .\scripts\restart-dev.ps1
# Options:
#   -RebuildAll    Rebuild all Docker images from scratch (no cache)
#   -InfraOnly     Only restart infrastructure (DB, RabbitMQ, Redis, pgAdmin)

param(
    [switch]$RebuildAll,
    [switch]$InfraOnly
)

$ErrorActionPreference = "Stop"

# Always run from project root (parent of scripts/)
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IAM Platform - Restart Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============== STOP ==============
Write-Host "[1/4] Stopping all containers..." -ForegroundColor Yellow

if ($RebuildAll) {
    docker compose --env-file .env down -v
    Write-Host "  [OK] All containers stopped + volumes removed" -ForegroundColor Green
} else {
    docker compose --env-file .env down
    Write-Host "  [OK] All containers stopped (volumes preserved)" -ForegroundColor Green
}

# ============== REBUILD ==============
if ($RebuildAll) {
    Write-Host ""
    Write-Host "[2/4] Rebuilding Docker images (no cache)..." -ForegroundColor Yellow
    docker compose --env-file .env build --no-cache
    Write-Host "  [OK] Images rebuilt" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[2/4] Skipping rebuild (use -RebuildAll to force)" -ForegroundColor Gray
}

# ============== START INFRASTRUCTURE ==============
Write-Host ""
Write-Host "[3/4] Starting infrastructure (PostgreSQL, RabbitMQ, Redis, MailHog, pgAdmin)..." -ForegroundColor Yellow

docker compose --env-file .env up -d postgres rabbitmq redis mailhog pgadmin

Write-Host "  Waiting for infrastructure to be healthy..."

$maxWait = 60
$elapsed = 0
$allHealthy = $false

while (-not $allHealthy -and $elapsed -lt $maxWait) {
    Start-Sleep -Seconds 5
    $elapsed += 5

    $pgHealth = docker inspect --format='{{.State.Health.Status}}' iam-postgres 2>$null
    $rmqHealth = docker inspect --format='{{.State.Health.Status}}' iam-rabbitmq 2>$null
    $redisHealth = docker inspect --format='{{.State.Health.Status}}' iam-redis 2>$null

    if ($pgHealth -eq "healthy" -and $rmqHealth -eq "healthy" -and $redisHealth -eq "healthy") {
        $allHealthy = $true
    } else {
        Write-Host "  Waiting... (${elapsed}s) PG=$pgHealth RMQ=$rmqHealth Redis=$redisHealth" -ForegroundColor Gray
    }
}

if ($allHealthy) {
    Write-Host "  [OK] All infrastructure services are healthy" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Some services may not be healthy yet, continuing..." -ForegroundColor Yellow
}

# ============== START MICROSERVICES ==============
if (-not $InfraOnly) {
    Write-Host ""
    Write-Host "[4/4] Starting microservices..." -ForegroundColor Yellow

    docker compose --env-file .env up -d auth-service user-service resource-service audit-service notification-service api-gateway frontend

    Write-Host "  Waiting for services to start (this may take 30-60 seconds)..."
    Start-Sleep -Seconds 30
} else {
    Write-Host ""
    Write-Host "[4/4] Skipping microservices (-InfraOnly mode)" -ForegroundColor Gray
}

# ============== STATUS ==============
Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Yellow

if ($InfraOnly) {
    $services = @(
        @{ Name = "PostgreSQL";    Container = "iam-postgres";   Port = "5432" },
        @{ Name = "RabbitMQ";      Container = "iam-rabbitmq";   Port = "5672/15672" },
        @{ Name = "Redis";         Container = "iam-redis";      Port = "6379" },
        @{ Name = "MailHog";       Container = "iam-mailhog";    Port = "1025/8025" },
        @{ Name = "pgAdmin4";      Container = "iam-pgadmin";    Port = "5050" }
    )
} else {
    $services = @(
        @{ Name = "PostgreSQL";    Container = "iam-postgres";              Port = "5432" },
        @{ Name = "RabbitMQ";      Container = "iam-rabbitmq";              Port = "5672/15672" },
        @{ Name = "Redis";         Container = "iam-redis";                 Port = "6379" },
        @{ Name = "MailHog";       Container = "iam-mailhog";               Port = "1025/8025" },
        @{ Name = "pgAdmin4";      Container = "iam-pgadmin";               Port = "5050" },
        @{ Name = "Auth Service";  Container = "iam-auth-service";          Port = "8081" },
        @{ Name = "User Service";  Container = "iam-user-service";          Port = "8082" },
        @{ Name = "Resource Svc";  Container = "iam-resource-service";      Port = "8083" },
        @{ Name = "Audit Service"; Container = "iam-audit-service";         Port = "8084" },
        @{ Name = "Notif Service"; Container = "iam-notification-service";  Port = "8085" },
        @{ Name = "API Gateway";   Container = "iam-api-gateway";           Port = "8090" },
        @{ Name = "Frontend";     Container = "iam-frontend";               Port = "3000" }
    )
}

foreach ($svc in $services) {
    $status = docker inspect --format='{{.State.Status}}' $svc.Container 2>$null
    $health = docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $svc.Container 2>$null

    if ($status -eq "running") {
        $color = if ($health -eq "healthy" -or $health -eq "N/A") { "Green" } else { "Yellow" }
        Write-Host ("  [OK] {0,-16} running (:{1})" -f $svc.Name, $svc.Port) -ForegroundColor $color
    } else {
        Write-Host ("  [FAIL] {0,-16} {1}" -f $svc.Name, $status) -ForegroundColor Red
    }
}

# ============== URLS ==============
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  IAM Platform restarted!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if ($InfraOnly) {
    Write-Host "Infrastructure URLs:" -ForegroundColor Cyan
    Write-Host "  pgAdmin4:        http://localhost:5050   (credentials in .env)" -ForegroundColor White
    Write-Host "  RabbitMQ UI:     http://localhost:15672  (credentials in .env)" -ForegroundColor White
    Write-Host "  MailHog UI:      http://localhost:8025" -ForegroundColor White
    Write-Host ""
    Write-Host "To run services locally:" -ForegroundColor Cyan
    Write-Host "  mvn clean compile" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl auth-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl user-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl api-gateway" -ForegroundColor White
} else {
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  PedalPass UI:    http://localhost:3000" -ForegroundColor White
    Write-Host "  API Gateway:     http://localhost:8090" -ForegroundColor White
    Write-Host "  Swagger UI:      http://localhost:8090/swagger-ui.html  (all services dropdown)" -ForegroundColor White
    Write-Host "  pgAdmin4:        http://localhost:5050                  (credentials in .env)" -ForegroundColor White
    Write-Host "  RabbitMQ UI:     http://localhost:15672                 (credentials in .env)" -ForegroundColor White
    Write-Host "  MailHog UI:      http://localhost:8025" -ForegroundColor White
    Write-Host ""
    Write-Host "Swagger per service:" -ForegroundColor Cyan
    Write-Host "  Auth Service:    http://localhost:8081/swagger-ui/index.html" -ForegroundColor White
    Write-Host "  User Service:    http://localhost:8082/swagger-ui/index.html" -ForegroundColor White
}
Write-Host ""

Pop-Location
