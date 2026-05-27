# HealthSys

Sistema de gestão hospitalar com arquitetura de microsserviços.

## Visão geral

| Componente | Tecnologia | Porta |
|------------|-----------|-------|
| Frontend | Next.js 16 + React 19 + TypeScript | 3000 |
| API Gateway | Spring Boot 3.2 + Spring Cloud Gateway | 8080 |
| Serviço de Usuários | Spring Boot 4.0 + PostgreSQL + JWT | 8081 |
| Serviço de Pacientes | Spring Boot 3.4 + PostgreSQL + Flyway | 8082 |
| Serviço de Prontuário | Spring Boot 4.0 + MongoDB | 8083 |

## Rodando com Docker (recomendado)

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Subir todos os serviços

```bash
cd Backend
docker-compose up --build
```

Na primeira execução os bancos de dados são criados automaticamente via Flyway.

Para parar e remover tudo (incluindo volumes):
```bash
docker-compose down -v
```

### Serviços disponíveis após o boot

| Serviço | URL |
|---------|-----|
| API Gateway | http://localhost:8080 |
| Usuários (direto) | http://localhost:8081 |
| Pacientes (direto) | http://localhost:8082 |
| Prontuário (direto) | http://localhost:8083 |
| Swagger — Usuários | http://localhost:8081/swagger-ui.html |
| Swagger — Pacientes | http://localhost:8082/swagger-ui.html |
| Swagger — Prontuário | http://localhost:8083/swagger-ui.html |

## Rodando o Frontend

Consulte [`Frontend/README.md`](Frontend/README.md) para instruções detalhadas.

Resumo rápido:
```bash
cd Frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do repositório

```
HealthSys/
├── Backend/
│   ├── api-gateway/       # Spring Cloud Gateway + filtro JWT
│   ├── usuarios/          # CRUD de usuários, autenticação JWT
│   ├── pacientes/         # CRUD de pacientes, vacinas, alergias
│   ├── prontuario/        # Prontuários eletrônicos (MongoDB)
│   └── docker-compose.yml # Orquestração local completa
└── Frontend/              # Interface web Next.js
```

## Banco de dados

| Banco | Tipo | Porta local |
|-------|------|------------|
| healthsys_usuarios | PostgreSQL 13 | 5433 |
| healthsyspacientes | PostgreSQL 13 | 5434 |
| healthsys_prontuario | MongoDB 4.4 | 27017 |

Os dados são persistidos em volumes Docker nomeados (`postgres_users_data`, `postgres_patients_data`, `mongo_records_data`).

   
