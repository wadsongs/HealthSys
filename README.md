# HealthSys

Sistema de gestão hospitalar com arquitetura de **microsserviços** (Spring Boot)
e frontend **Next.js**. Roteamento e autenticação centralizados em um **API
Gateway** (JWT), comunicação **síncrona** (REST via gateway) e **assíncrona**
(eventos via RabbitMQ), cache distribuído (Redis) e observabilidade
(Prometheus + Grafana).

## Visão geral dos componentes

| Componente | Tecnologia | Porta (host) | Build |
|------------|-----------|--------------|-------|
| Frontend | Next.js 16 + React 19 + TypeScript | 3000 | npm |
| API Gateway | Spring Cloud Gateway + filtro JWT | 8080 | Maven |
| Serviço de Usuários | Spring Boot + PostgreSQL + Spring Security/JWT + WebSocket | 8081 | Maven |
| Serviço de Pacientes | Spring Boot + PostgreSQL + Flyway + **Redis (cache)** | 8082 | Gradle |
| Serviço de Prontuário | Spring Boot + MongoDB | 8083 | Maven |
| Serviço de Triagem | Spring Boot + PostgreSQL + Flyway | 8084 | Maven |
| RabbitMQ | Broker de mensageria (AMQP) | 5672 / 15672 | imagem |
| Redis | Cache distribuído | 6379 | imagem |
| Prometheus | Coleta de métricas | 9090 | imagem |
| Grafana | Dashboards de métricas | **3001** | imagem |

> **Backend = Spring Boot 3.3.5** em todos os serviços (versão única — ver
> [Stack e versões](#stack-e-versões)).

## Arquitetura

```
                         ┌──────────────────────┐
        HTTP/JWT         │   Frontend (Next.js)  │  :3000
        ───────────────▶ └──────────┬───────────┘
                                    │  REST + Bearer JWT
                                    ▼
                         ┌──────────────────────┐
                         │  API Gateway  :8080   │  valida JWT, injeta
                         │  (Spring Cloud GW)    │  X-User-Id / Perfil / Email
                         └───┬─────┬─────┬─────┬─┘
              /usuarios /pacientes /prontuarios /triagens
                  │        │         │          │
        ┌─────────▼──┐ ┌───▼──────┐ ┌▼─────────┐ ┌▼────────┐
        │ Usuários   │ │ Pacientes│ │Prontuário│ │ Triagem │
        │ :8081      │ │ :8082    │ │ :8083    │ │ :8084   │
        │ PostgreSQL │ │ PostgreSQL│ │ MongoDB  │ │PostgreSQL│
        │            │ │ + Redis  │ │          │ │         │
        └─────┬──────┘ └────┬─────┘ └────┬─────┘ └────┬────┘
              │             │            │            │
              └─────────────┴─────┬──────┴────────────┘
                                  ▼
                          ┌───────────────┐
                          │   RabbitMQ     │  eventos de domínio (assíncrono)
                          └───────────────┘

  Observabilidade:  cada serviço expõe /actuator/prometheus
                    Prometheus :9090  ──scrape──▶  Grafana :3001
```

### Comunicação assíncrona (RabbitMQ)

Eventos de domínio desacoplam os serviços. Exemplos implementados:

- **Prontuário → Pacientes:** ao atualizar alergias (`ALERGIAS_ATUALIZADAS`),
  o serviço de pacientes sincroniza o cadastro do paciente.
- **Pacientes:** publica `PACIENTE_CRIADO` ao cadastrar.
- **Triagem:** publica `TRIAGEM_CRIADA` / `TRIAGEM_URGENTE` conforme o risco.

O payload desses eventos é o DTO `ProntuarioEvent`, mantido em cada serviço.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (com Docker Compose v2)
- Para rodar serviços fora do Docker: **JDK 21**, **Maven 3.9+**, **Gradle 8.7**, **Node 20+**

## Rodando com Docker (recomendado)

```bash
cd Backend
docker-compose up --build
```

Na primeira execução, os bancos PostgreSQL são criados e migrados via Flyway.

Parar e remover tudo (incluindo volumes):
```bash
docker-compose down -v
```

### Frontend

```bash
cd Frontend
npm install
npm run dev   # http://localhost:3000
```

### URLs após o boot

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Swagger — Usuários | http://localhost:8081/swagger-ui.html |
| Swagger — Pacientes | http://localhost:8082/swagger-ui.html |
| Swagger — Prontuário | http://localhost:8083/swagger-ui.html |
| Swagger — Triagem | http://localhost:8084/swagger-ui.html |
| RabbitMQ (admin) | http://localhost:15672 — `guest` / `guest` |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

> **Portas:** o Grafana é publicado em **3001** (host) para não conflitar com o
> Frontend Next.js, que usa a **3000**.

## Bancos de dados (database-per-service)

| Banco | Tipo | Porta (host) | Serviço |
|-------|------|--------------|---------|
| healthsys_usuarios | PostgreSQL 13 | 5433 | Usuários |
| healthsyspacientes | PostgreSQL 13 | 5434 | Pacientes |
| healthsys_triagem | PostgreSQL 13 | 5435 | Triagem |
| healthsys_prontuario | MongoDB 4.4 | 27017 | Prontuário |

Dados persistidos em volumes nomeados: `postgres_users_data`,
`postgres_patients_data`, `postgres_triagem_data`, `mongo_records_data`,
`redis_data`, `grafana_data`.

## Variáveis de ambiente (principais)

Definidas no `Backend/docker-compose.yml`; em execução local, use os valores padrão.

| Variável | Usada por | Padrão / exemplo |
|----------|-----------|------------------|
| `JWT_SECRET` | api-gateway, usuarios | `healthsys-secret-key-unifor-2024-distributed-systems` |
| `USERS_SERVICE_URL` | api-gateway | `http://usuarios:8081` |
| `PATIENTS_SERVICE_URL` | api-gateway | `http://pacientes:8082` |
| `RECORDS_SERVICE_URL` | api-gateway | `http://prontuario:8083` |
| `TRIAGE_SERVICE_URL` | api-gateway | `http://triagem:8084` |
| `SPRING_DATASOURCE_URL` | usuarios, pacientes, triagem | `jdbc:postgresql://<host>:5432/<db>` |
| `SPRING_DATASOURCE_USERNAME` / `_PASSWORD` | serviços PostgreSQL | `wadson` / `postgres` |
| `SPRING_DATA_MONGODB_URI` | prontuario | `mongodb://mongo_records:27017/healthsys_prontuario` |
| `SPRING_RABBITMQ_HOST` | usuarios, pacientes, prontuario, triagem | `rabbitmq` |
| `REDIS_HOST` / `REDIS_PORT` | pacientes | `redis` / `6379` |

> ⚠️ Segredos (JWT, senhas, `guest/guest` do RabbitMQ) estão em texto plano
> apenas para fins acadêmicos/demo. Em produção, usar um *secret manager* + TLS.

## Stack e versões

Todos os serviços backend usam **Spring Boot 3.3.5** (versão única do monorepo).

**Por que 3.3.5?** É o ponto que minimiza risco de incompatibilidade:
- mantém o *release train* **Spring Cloud 2023.0.x** já usado pelo API Gateway
  (compatível com Boot 3.2–3.3), evitando um upgrade arriscado do Spring Cloud;
- traz **Flyway 10**, requerido pelo `flyway-database-postgresql` usado em Pacientes;
- alinha o **springdoc-openapi** em `2.6.0` em todos os serviços.

A documentação anterior citava "Spring Boot 3.2 / 3.4 / 4.0" — versões que não
correspondiam ao código (inclusive uma versão inexistente). Isso foi unificado.

## Estrutura do repositório

```
HealthSys/
├── Backend/
│   ├── api-gateway/       # Spring Cloud Gateway + filtro JWT
│   ├── usuarios/          # Autenticação JWT, CRUD de usuários, WebSocket
│   ├── pacientes/         # CRUD de pacientes/vacinas/alergias + cache Redis
│   ├── prontuario/        # Prontuários eletrônicos (MongoDB)
│   ├── triagem/           # Triagem/classificação de risco
│   ├── prometheus.yml     # Targets de scrape (todos os serviços)
│   └── docker-compose.yml # Orquestração local completa
└── Frontend/              # Interface web Next.js
```

## Testes e CI

```bash
# Serviços Maven
cd Backend/<servico> && mvn -B clean verify

# Serviço Gradle (Pacientes) — testes unitários
cd Backend/pacientes && gradle build

# Testes de integração de Pacientes (exigem PostgreSQL via docker-compose)
cd Backend/pacientes && gradle integrationTest
```

A pipeline (`.github/workflows/ci.yml`) executa em push/PR na `main`:
1. **build-and-test** — build + testes unitários de **todos** os 5 serviços
   (Maven + Gradle);
2. **docker-build** — valida `docker compose build`.

## Alternativas avaliadas

### Mensageria: RabbitMQ vs Apache Kafka

Adotamos **RabbitMQ** (e **não** Kafka). Os eventos do HealthSys são
**notificações de domínio** de baixo volume, ponto-a-ponto, em que importam o
roteamento por *exchange*, *acknowledgements* e filas de retry/DLQ — pontos
fortes do RabbitMQ. Kafka brilha em *streaming* de alto throughput com retenção
e *replay* de log (event sourcing, analytics), cenário que não faz parte do
escopo atual. Manter os dois traria complexidade operacional sem benefício, por
isso o projeto usa **apenas RabbitMQ**.

> Caso material de apresentação anterior mencione Kafka, trata-se de citação
> indevida: **não há Kafka no código**.
