# PedalPass IAM Platform

IAM (Identity and Access Management) platform for managing employee access to physical resources (offices, meeting rooms, equipment) and digital resources (apps, VPN, file shares). Built as a microservices architecture with a React frontend for my Master's thesis in Cybersecurity.

## Architecture overview

The system runs 6 Spring Boot microservices behind an API Gateway, each with its own PostgreSQL database. Services communicate asynchronously through RabbitMQ. The React frontend (PedalPass) consumes all APIs through the gateway.

```
                    React Frontend (:3000)
                            |
                    API Gateway (:8090)
                    JWT | Rate Limit | CORS
                            |
    +----------+----------+----------+----------+----------+
    |          |          |          |          |          |
  Auth     User     Resource    Audit    Notification
  :8081    :8082     :8083      :8084      :8085
    |          |          |          |          |
  iam_auth  iam_users  iam_res   iam_audit  iam_notif
   (PG)      (PG)      (PG)      (PG)       (PG)
    |          |          |          |          |
    +-----+----+-----+----+-----+----+-----+---+
          |          |           |
       RabbitMQ    Redis      Mailpit
       :5672       :6379     :1025/:8025
```

Infrastructure: PostgreSQL 16, RabbitMQ 3.13, Redis 7, Mailpit (dev email), pgAdmin4 (DB UI)

## Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8090 | JWT validation, Redis blacklist check, rate limiting, CORS, routing |
| Auth Service | 8081 | Register, login (BCrypt), JWT access tokens (HS512, 15min), refresh token rotation (7 days), logout with Redis blacklist + refresh revocation, account lockout (5 attempts / 30min) |
| User Service | 8082 | CRUD users, roles, departments, permissions (RBAC). Auto-sync from auth-service via RabbitMQ |
| Resource Service | 8083 | Physical/digital resources, access request workflow, collision detection via RabbitMQ |
| Audit Service | 8084 | Consumes all RabbitMQ events, audit logs with DTOs, security alerts, brute force detection, dismiss/resolve alerts |
| Notification Service | 8085 | Email via Mailpit, in-app notifications, user preferences (auto-created, per type: email/in-app toggle), admin email on new access requests |
| **Frontend** | **3000** | **React 19 SPA (PedalPass) — cyberpunk dark theme, role-based UI** |

## Frontend (PedalPass)

React 19 + TypeScript + Vite 7 application with cyberpunk dark theme (violet/purple palette, oklch colors).

**Stack:** Tailwind CSS v4, shadcn/ui (Radix), TanStack Query v5, TanStack Table v8, React Router v7, react-hook-form + zod v4, Axios with JWT interceptor, lucide-react icons, sonner toasts

**Pages:**

| Page | Route | Access |
|------|-------|--------|
| Login / Register | `/login`, `/register` | Public |
| Dashboard | `/dashboard` | All authenticated users |
| Users | `/users` | ADMIN |
| Resources | `/resources` | All authenticated users |
| Access Requests | `/access-requests` | All authenticated users (review tab: ADMIN/RESOURCE_MANAGER) |
| Audit & Security | `/audit` | ADMIN, SECURITY_OFFICER |
| Notifications | `/notifications` | All authenticated users |
| Profile | `/profile` | All authenticated users |

**Features:**
- JWT auth with automatic token refresh and concurrent request queuing
- Role-based routing (ProtectedRoute, RoleGuard) and conditional UI rendering
- Server-side pagination via TanStack Table + custom DataTablePagination
- Grid/table view toggle for resources
- Real-time notification count polling (30s)
- Collapsible sidebar with mobile Sheet drawer
- Error boundary for graceful crash handling
- Dockerized with nginx (SPA fallback + API proxy)

## Swagger / OpenAPI

Centralized Swagger UI on the API Gateway with dropdown per service:

| URL | Description |
|-----|-------------|
| http://localhost:8090/swagger-ui.html | Centralized Swagger UI (all services dropdown) |
| http://localhost:8081/swagger-ui/index.html | Auth Service direct |
| http://localhost:8082/swagger-ui/index.html | User Service direct |
| http://localhost:8083/swagger-ui/index.html | Resource Service direct |
| http://localhost:8084/swagger-ui/index.html | Audit Service direct |
| http://localhost:8085/swagger-ui/index.html | Notification Service direct |

API docs JSON: `http://localhost:8090/v3/api-docs/{service-name}` (e.g. `auth-service`, `user-service`, `resource-service`, `audit-service`, `notification-service`)

## Setup

Prerequisites: JDK 21 (Temurin), Maven 3.9+, Docker Desktop, Node.js 22+ (for frontend development)

```bash
git clone https://github.com/Seboostian02/pedalpass-iam-platform.git
cd pedalpass-iam-platform
```

Create `.env` in the project root with your credentials:
```properties
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET_KEY=your_jwt_secret_min_32_chars
RABBITMQ_USER=your_rabbitmq_user
RABBITMQ_PASSWORD=your_rabbitmq_password
REDIS_PASSWORD=your_redis_password
MAIL_FROM=your_sender_email@example.com
PGADMIN_EMAIL=your_email@example.com
PGADMIN_PASSWORD=your_pgadmin_password
```

## Development scripts

All scripts are in `scripts/` and must be run from the project root (`iam-platform/`).

### Start everything (Docker)

```powershell
.\scripts\start-dev.ps1
```

Starts all infrastructure (PostgreSQL, RabbitMQ, Redis, Mailpit, pgAdmin4), all 6 microservices, and the frontend (PedalPass) in Docker containers. Waits for health checks and shows status + URLs at the end.

Options:
- `-InfraOnly` — start only infrastructure (useful for running services locally with `mvn spring-boot:run`)
- `-RebuildAll` — rebuild all Docker images from scratch (no cache)
- `-StopAll` — stop all running containers
- `-SkipPrerequisiteCheck` — skip Java/Maven/Docker version checks

### Restart everything

```powershell
.\scripts\restart-dev.ps1
```

Stops all containers, then starts everything back up. Same health checks and status output as `start-dev.ps1`.

Options:
- `-InfraOnly` — restart only infrastructure
- `-RebuildAll` — stop + remove volumes + rebuild images + start (clean slate)

### Stop everything

```powershell
.\scripts\stop-dev.ps1
.\scripts\stop-dev.ps1 -RemoveVolumes   # also wipe databases, pgAdmin data, etc.
```

### Run services locally (alternative)

If you prefer running Java services locally instead of in Docker:

```powershell
.\scripts\start-dev.ps1 -InfraOnly   # start infrastructure in Docker
mvn clean compile                      # compile all modules
mvn spring-boot:run -pl auth-service   # start auth service
mvn spring-boot:run -pl user-service   # start user service
mvn spring-boot:run -pl api-gateway    # start API gateway (port 8090 locally)

# Frontend dev server (hot reload)
cd frontend
npm install
npm run dev                            # starts on http://localhost:3000
```

> **Note:** API Gateway listens on port **8090** locally and is mapped `8090:8080` in Docker. Frontend dev server connects to the gateway at `http://localhost:8090` (configured in `frontend/.env`).

## URLs

After everything starts:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | **PedalPass UI** — React frontend |
| http://localhost:8090/swagger-ui.html | Swagger UI — centralized (all services dropdown) |
| http://localhost:8081/swagger-ui/index.html | Swagger UI — Auth Service direct |
| http://localhost:8082/swagger-ui/index.html | Swagger UI — User Service direct |
| http://localhost:8083/swagger-ui/index.html | Swagger UI — Resource Service direct |
| http://localhost:8084/swagger-ui/index.html | Swagger UI — Audit Service direct |
| http://localhost:8085/swagger-ui/index.html | Swagger UI — Notification Service direct |
| http://localhost:5050 | pgAdmin4 — PostgreSQL UI (credentials in `.env`) |
| http://localhost:8090 | API Gateway |
| http://localhost:8081/actuator/health | Auth Service health check |
| http://localhost:8082/actuator/health | User Service health check |
| http://localhost:8083/actuator/health | Resource Service health check |
| http://localhost:8084/actuator/health | Audit Service health check |
| http://localhost:8085/actuator/health | Notification Service health check |
| http://localhost:15672 | RabbitMQ Management UI (credentials in `.env`) |
| http://localhost:8025 | Mailpit — email testing UI (replaced MailHog) |

> Gateway runs on port **8090** both locally and via Docker (mapped `8090:8080`).

## Secrets management

All secrets are centralized in `.env` (excluded from git via `.gitignore`).
No passwords are hardcoded anywhere in the project (not in yml, docker-compose, or scripts).

**How secrets are loaded:**
- **application.yml** (Spring Boot) - `spring.config.import: optional:file:../.env[.properties]`
- **docker-compose.yml** - `docker compose --env-file .env` flag (variables: `${DB_USER}`, `${DB_PASSWORD}`, etc.)
- **start-dev.ps1** - uses `docker compose --env-file .env` for all commands

## Project structure

```
iam-platform/
├── pom.xml                 # parent POM (Spring Boot 3.3.5, Spring Cloud 2023.0.3)
├── docker-compose.yml      # PostgreSQL, RabbitMQ, Redis, Mailpit, pgAdmin4
├── .env                    # secrets (gitignored)
├── common-lib/             # shared DTOs, events, exceptions, constants
├── api-gateway/            # Spring Cloud Gateway + JWT filter + centralized Swagger
├── auth-service/           # authentication + JWT + refresh tokens
├── user-service/           # user management + RBAC + RabbitMQ event listener
├── resource-service/       # resources + access requests + collisions
├── audit-service/          # event consumption + audit logs + alerts
├── notification-service/   # email + in-app notifications
├── frontend/              # React 19 SPA (PedalPass) - Vite + Tailwind + shadcn/ui
└── scripts/
    ├── start-dev.ps1       # start environment (infra + services)
    ├── stop-dev.ps1        # stop all containers
    ├── restart-dev.ps1     # restart environment (stop + start)
    ├── init-databases.sql  # creates 5 PostgreSQL databases on first run
    ├── seed-data.sql       # cross-database seed data (Flyway handles per-service)
    └── pgadmin-servers.json # pgAdmin auto-connect config
```

## RabbitMQ events

Exchange: `iam.events` (Topic)

| Routing key | Event | Published by |
|-------------|-------|-------------|
| `auth.login.success` | Login audit | Auth Service |
| `auth.login.failed` | Failed login audit | Auth Service |
| `auth.register` | User registration | Auth Service |
| `user.created` | User sync to user-service | Auth Service |
| `resource.access.requested` | New access request | Resource Service |
| `resource.access.approved` | Request approved | Resource Service |
| `resource.access.denied` | Request denied | Resource Service |
| `resource.access.revoked` | Access revoked | Resource Service |
| `resource.collision.detected` | Time slot collision | Resource Service |

Consumers: Audit Service (all events), Notification Service (welcome, access decisions, collisions, security alerts)

## Troubleshooting

### Docker Desktop stuck on "Starting" (Windows)

```
request returned 500 Internal Server Error for API route and version
```

Fix (in order):
1. Restart WSL: `wsl --shutdown` then reopen Docker Desktop (wait ~60s)
2. Kill and restart: `Stop-Process -Name 'Docker Desktop' -Force` then `Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'`
3. If it persists: check Virtualization in BIOS, ensure "Windows Subsystem for Linux" and "Virtual Machine Platform" are enabled in Windows Features, run `wsl --update`

### Stale Docker images after code changes

After modifying Java code, the Docker image needs to be rebuilt:

```powershell
docker compose build --no-cache <service-name>
docker compose up -d <service-name>
# or rebuild everything:
.\scripts\restart-dev.ps1 -RebuildAll
```

## Development status

- **Phase 1** - Project foundation, all 6 services scaffolded, Docker Compose, Flyway migrations, CI/CD
- **Phase 2** - Auth Service & API Gateway fully functional and tested
- **Phase 2.5** - Swagger/OpenAPI centralized on API Gateway with dropdown per service
- **Phase 3** - User Management + RBAC: CRUD users/roles/departments, auth→user sync via RabbitMQ, pgAdmin4
- **Phase 3.5** - Full Docker deployment: all 11 containers healthy, environment variables, dev scripts
- **Phase 4** - Resource Service: CRUD with DTOs/validation/Swagger, access request workflow (PENDING/APPROVED/DENIED/COLLISION/REVOKED), collision detection for physical resources, RabbitMQ event publishing, resource deactivation with cascading revocation
- **Phase 5** - Audit Service + Notification Service: DTOs/Swagger/OpenAPI for both, RabbitMQ event type fixes (mixed event deserialization), brute force detection (5 failed logins → CRITICAL alert), security alert workflow (resolve/dismiss), notification preferences (per-type email/in-app toggle), configurable MAIL_FROM, login failed email alerts, GlobalExceptionHandler for both services
- **Phase 6** - React frontend (PedalPass): React 19 + Vite 7 + Tailwind v4 + shadcn/ui, cyberpunk dark theme, JWT auth with refresh queue, role-based routing, 8 pages (Dashboard, Users, Resources, Access Requests, Audit, Notifications, Profile, 404), TanStack Table/Query, Dockerized with nginx
- **Phase 6.5** - Replaced MailHog with Mailpit due to MailHog bugs (500 errors, emails disappearing after viewing). Added NotificationType enum, auto-created notification preferences, admin email notifications for access requests (inter-service REST call to user-service)
- **Phase 7** - MFA, security hardening

## Built with

**Backend:** Java 21, Spring Boot 3.3.5, Spring Cloud Gateway, SpringDoc OpenAPI 2.6.0, PostgreSQL 16, RabbitMQ 3.13, Redis 7, Docker, Flyway, Lombok, MapStruct, BCrypt, JJWT (HS512), pgAdmin4, GitHub Actions

**Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS v4, shadcn/ui (Radix), TanStack Query v5, TanStack Table v8, React Router v7, react-hook-form, zod v4, Axios, jwt-decode, lucide-react, sonner, date-fns, recharts
