# HealthSys — Frontend

Interface web do sistema HealthSys, construída com **Next.js 16**, **React 19**, **TypeScript** e **TailwindCSS**.

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- npm (incluído no Node) **ou** [pnpm](https://pnpm.io/)

## Como rodar

### 1. Entrar na pasta do frontend

```bash
cd Frontend
```

### 2. Instalar dependências

Com npm:
```bash
npm install
```

Com pnpm:
```bash
pnpm install
```

### 3. Iniciar em modo desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

### 4. Acessar no navegador

| Rota | URL |
|------|-----|
| Home / Dashboard | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Cadastro | http://localhost:3000/cadastro |

## Rodar com o backend (Docker)

O frontend consome os serviços de backend nos endereços abaixo. Com o Docker Compose rodando, tudo estará disponível automaticamente:

| Serviço | URL |
|---------|-----|
| API Gateway | http://localhost:8080 |
| Usuários | http://localhost:8081 |
| Pacientes | http://localhost:8082 |
| Prontuário | http://localhost:8083 |

Para subir o backend:
```bash
cd ../Backend
docker-compose up --build
```

## Build para produção

```bash
npm run build
npm run start
```

## Estrutura de pastas

```
Frontend/
├── app/
│   ├── (dashboard)/   # Páginas protegidas
│   ├── login/
│   └── cadastro/
├── components/        # Componentes reutilizáveis (shadcn/ui)
├── hooks/             # Custom hooks
├── lib/               # Utilitários
└── public/            # Assets estáticos
```
