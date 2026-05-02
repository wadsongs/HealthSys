# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

HealthSys is a distributed healthcare management system built as a Spring Boot microservices monorepo with a Next.js frontend. The backend uses an API Gateway pattern with JWT authentication.

## Running the System

### Full stack (recommended)
```bash
cd Backend
docker-compose up --build
```
```bash
cd Frontend
npm install && npm run dev
```

### Individual backend services
```bash
# Usuários, Prontuário, API Gateway (Maven)
mvn clean package -DskipTests && java -jar target/*.jar

# Pacientes (Gradle)
./gradlew clean bootJar && java -jar build/libs/*.jar
```

## Running Tests

```bash
# Usuários, Prontuário, API Gateway
mvn test

# Pacientes
./gradlew test

# Run a single test class (Maven)
mvn test -Dtest=ClassName

# Run a single test class (Gradle)
./gradlew test --tests "com.br.unifor.pacientes.controller.PacienteControllerTest"
```

## Service Map

| Service | Port | Build Tool | Database |
|---|---|---|---|
| Frontend | 3000 | npm/Next.js | — |
| API Gateway | 8080 | Maven | — |
| Usuários | 8081 | Maven | PostgreSQL :5433 (`healthsys_usuarios`) |
| Pacientes | 8082 | Gradle | PostgreSQL :5434 (`healthsyspacientes`) |
| Prontuário | 8083 | Maven | MongoDB :27017 (`healthsys_prontuario`) |

All backend services expose Swagger UI at `/swagger-ui.html`.

## Architecture

### Request flow
```
Frontend (3000) → API Gateway (8080) → [Usuários|Pacientes|Prontuário]
```

The API Gateway (`Backend/api-gateway`) handles all routing and JWT validation before forwarding requests. Public routes (`/auth/**`) bypass JWT. Protected routes receive injected headers: `X-User-Id`, `X-User-Perfil`, `X-User-Email`.

### Authentication
- JWT tokens are issued by the Usuários service and validated by the API Gateway.
- Secret: `healthsys-secret-key-unifor-2024-distributed-systems` (override via env var).
- Token expiration: 24 hours.

### Database strategy
- **PostgreSQL** for transactional data (users, patients) with Flyway schema migrations.
- **MongoDB** for flexible document data (medical records). MongoDB Auditing is enabled in the Prontuário service.
- Each service owns its database independently (database-per-service pattern).

### Key business rules in Prontuário
- Medication prescriptions (`Medicamento`) require the `MEDICO` role (enforced via `X-User-Perfil` header).
- All record accesses are audit-logged (`LogAuditoria`) for healthcare compliance.

## Project Layout

```
Backend/
├── api-gateway/      # Spring Cloud Gateway — routing + JWT filter
├── usuarios/         # Auth + user CRUD (Spring Security + JwtService)
├── pacientes/        # Patient + vaccine + allergy management
├── prontuario/       # Medical records — appointments, exams, medications, auditing
└── docker-compose.yml

Frontend/
├── app/
│   ├── (dashboard)/  # Protected routes
│   ├── login/
│   └── cadastro/
├── components/       # shadcn/ui components
└── hooks/
```

## Mixed Build Tools

The **pacientes** service uses Gradle 8.7; all other backend services use Maven. When adding dependencies, use `build.gradle` for pacientes and `pom.xml` for the rest.

## Frontend Stack

Next.js 16 + React 19 + TypeScript + TailwindCSS + shadcn/ui. Form validation uses `react-hook-form` + `zod`. All API calls go through the gateway at `http://localhost:8080`.