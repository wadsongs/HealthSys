## Como iniciar o Frontend

### 1) Pre-requisitos
- Node.js 20+ instalado
- npm instalado (normalmente vem com o Node)

### 2) Entrar na pasta do frontend
No terminal, na raiz do projeto:

```powershell
cd "HealthSys\Frontend"
```

### 3) Instalar dependencias

```powershell
npm install
```

### 4) Iniciar o frontend em modo desenvolvimento

```powershell
npm run dev
```

### 5) Acessar no navegador
- URL: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)

### 6) Observacao sobre backend
Para o Front, foi planejado consumir os servicos de backend nesses enderecos:
- `usuarios` em `http://localhost:8081`
- `pacientes` em `http://localhost:8082`
- `prontuario` em `http://localhost:8083`

Se os backends nao estiverem ativos, o frontend abre normalmente, mas as operacoes de autenticacao e integracao podem falhar.