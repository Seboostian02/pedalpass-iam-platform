# =============================================
# IAM Platform - Development Environment Launcher
# =============================================
# Usage: .\scripts\start-dev.ps1
# Options:
#   -SkipPrerequisiteCheck  Skip tool version checks
#   -RebuildAll             Rebuild all Docker images from scratch
#   -InfraOnly              Only start infrastructure (DB, RabbitMQ, Redis)
#   -StopAll                Stop all running containers

param(
    [switch]$SkipPrerequisiteCheck,
    [switch]$RebuildAll,
    [switch]$InfraOnly,
    [switch]$StopAll
)

$ErrorActionPreference = "Stop"

# Always run from project root (parent of scripts/)
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IAM Platform - Dev Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============== STOP ALL ==============
if ($StopAll) {
    Write-Host "Stopping all containers..." -ForegroundColor Yellow
    docker compose --env-file .env down
    Write-Host "All containers stopped." -ForegroundColor Green
    Pop-Location
    exit 0
}

# ============== PREREQUISITE CHECKS ==============
if (-not $SkipPrerequisiteCheck) {
    Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

    # Temporarily allow errors (external commands write to stderr)
    $ErrorActionPreference = "Continue"

    # Check Java
    $javaOutput = & java -version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0 -or $javaOutput -match "version") {
        if ($javaOutput -match "21") {
            Write-Host "  [OK] Java 21 found" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Java found but not version 21" -ForegroundColor Yellow
            Write-Host "         Install JDK 21: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [FAIL] Java not found!" -ForegroundColor Red
        Write-Host "         Install JDK 21: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    # Check Maven
    $mvnOutput = & mvn --version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Maven found" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Maven not found!" -ForegroundColor Red
        Write-Host "         Install: https://maven.apache.org/download.cgi" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    # Check Docker
    $dockerOutput = & docker --version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Docker found" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Docker not found!" -ForegroundColor Red
        Write-Host "         Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    # Check Docker daemon
    $null = & docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Docker daemon not running. Start Docker Desktop first!" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    # Check Node.js
    $nodeOutput = & node --version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Node.js found: $($nodeOutput.Trim())" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Node.js not found. Required for frontend development." -ForegroundColor Yellow
    }

    # Restore strict error handling
    $ErrorActionPreference = "Stop"
}

# ============== ENV FILE ==============
Write-Host ""
Write-Host "[2/5] Checking environment configuration..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  [OK] Created .env from .env.example" -ForegroundColor Green
        Write-Host "  [INFO] Review .env and update passwords for production!" -ForegroundColor Yellow
    } else {
        Write-Host "  [WARN] No .env file found, using Docker Compose defaults" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [OK] .env file exists" -ForegroundColor Green
}

# ============== REBUILD ==============
if ($RebuildAll) {
    Write-Host ""
    Write-Host "Rebuilding everything from scratch..." -ForegroundColor Yellow
    docker compose --env-file .env down -v
    docker compose --env-file .env build --no-cache
}

# ============== START INFRASTRUCTURE ==============
Write-Host ""
Write-Host "[3/5] Starting infrastructure (PostgreSQL, RabbitMQ, Redis, MailHog, pgAdmin)..." -ForegroundColor Yellow

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

if ($InfraOnly) {
    Write-Host ""
    Write-Host "Infrastructure started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Infrastructure URLs:" -ForegroundColor Cyan
    Write-Host "  pgAdmin4:        http://localhost:5050   (credentials in .env)" -ForegroundColor White
    Write-Host "  RabbitMQ UI:     http://localhost:15672  (credentials in .env)" -ForegroundColor White
    Write-Host "  MailHog UI:      http://localhost:8025" -ForegroundColor White
    Write-Host ""
    Write-Host "To run services locally:" -ForegroundColor Cyan
    Write-Host "  mvn clean compile" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl auth-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl user-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl resource-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl audit-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl notification-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run -pl api-gateway" -ForegroundColor White
    Pop-Location
    exit 0
}

# ============== START MICROSERVICES ==============
Write-Host ""
Write-Host "[4/5] Starting microservices..." -ForegroundColor Yellow

docker compose --env-file .env up -d auth-service user-service resource-service audit-service notification-service api-gateway frontend

Write-Host "  Waiting for services to start (this may take 30-60 seconds)..."
Start-Sleep -Seconds 30

# Start Vite dev server for frontend (background process, port 5173)
Write-Host ""
Write-Host "  Starting Vite dev server (frontend dev with HMR)..." -ForegroundColor Yellow
$frontendDir = Join-Path $projectRoot "frontend"
if (Test-Path (Join-Path $frontendDir "package.json")) {
    Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory $frontendDir -WindowStyle Hidden
    Write-Host "  [OK] Vite dev server started on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  [WARN] frontend/package.json not found, skipping Vite" -ForegroundColor Yellow
}

# ============== STATUS ==============
Write-Host ""
Write-Host "[5/5] Checking service status..." -ForegroundColor Yellow

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
    @{ Name = "Frontend";      Container = "iam-frontend";              Port = "3000" }
)

$ErrorActionPreference = "Continue"
foreach ($svc in $services) {
    $status = docker inspect --format='{{.State.Status}}' $svc.Container 2>$null
    $health = docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $svc.Container 2>$null

    if ($status -eq "running") {
        $color = if ($health -eq "healthy" -or $health -eq "N/A") { "Green" } else { "Yellow" }
        Write-Host ("  [OK] {0,-16} running (:{1})" -f $svc.Name, $svc.Port) -ForegroundColor $color
    } else {
        $displayStatus = if ($status) { $status } else { "not found" }
        Write-Host ("  [FAIL] {0,-16} {1}" -f $svc.Name, $displayStatus) -ForegroundColor Red
    }
}
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  IAM Platform is running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  PedalPass UI:    http://localhost:3000" -ForegroundColor White
Write-Host "  API Gateway:     http://localhost:8090" -ForegroundColor White
Write-Host "  Swagger UI:      http://localhost:8090/swagger-ui.html  (all services dropdown)" -ForegroundColor White
Write-Host "  pgAdmin4:        http://localhost:5050                  (credentials in .env)" -ForegroundColor White
Write-Host "  RabbitMQ UI:     http://localhost:15672                 (credentials in .env)" -ForegroundColor White
Write-Host "  MailHog UI:      http://localhost:8025" -ForegroundColor White
Write-Host "  PostgreSQL:      localhost:5432                         (credentials in .env)" -ForegroundColor White
Write-Host ""
Write-Host "Swagger per service:" -ForegroundColor Cyan
Write-Host "  Auth Service:    http://localhost:8081/swagger-ui/index.html" -ForegroundColor White
Write-Host "  User Service:    http://localhost:8082/swagger-ui/index.html" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  docker compose logs -f auth-service      # View service logs" -ForegroundColor White
Write-Host "  docker compose ps                        # Check container status" -ForegroundColor White
Write-Host "  .\scripts\restart-dev.ps1                # Restart everything" -ForegroundColor White
Write-Host "  .\scripts\stop-dev.ps1                   # Stop everything" -ForegroundColor White
Write-Host ""

Pop-Location
