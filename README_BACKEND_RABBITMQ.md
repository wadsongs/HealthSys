# Implementação de Mensageria e Notificações Assíncronas

Este documento explica as alterações feitas no backend para implementar comunicação assíncrona entre os microserviços usando RabbitMQ.

## O que foi implementado?

Foram implementadas duas funcionalidades do backlog:
1. **Definir mensageria (RabbitMQ)** - Configuração do sistema de filas de mensagens
2. **Implementar notificações assíncronas** - Comunicação entre serviços sem bloquear o sistema

## Por que isso é importante?

Antes, os serviços funcionavam de forma isolada. Se o serviço de prontuário atualizasse as alergias de um paciente, o serviço de pacientes não ficava sabendo. Com essa implementação, quando as alergias são atualizadas no prontuário, uma mensagem é enviada automaticamente para o serviço de pacientes sincronizar os dados.

---

## Arquivos Modificados

### 1. Backend/usuarios/pom.xml
**O que é:** Arquivo de configuração do Maven (gerenciador de dependências Java) para o serviço de usuários.

**O que foi feito:** Adicionada a dependência do RabbitMQ para permitir que este serviço se conecte ao sistema de mensagens.

**Alteração:**
```xml
<!-- RabbitMQ para notificações assíncronas -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

### 2. Backend/pacientes/build.gradle
**O que é:** Arquivo de configuração do Gradle (outro gerenciador de dependências Java) para o serviço de pacientes.

**O que foi feito:** Adicionada a dependência do RabbitMQ.

**Alteração:**
```gradle
// RabbitMQ para notificações assíncronas
implementation 'org.springframework.boot:spring-boot-starter-amqp:3.4.5'
```

### 3. Backend/prontuario/pom.xml
**O que é:** Arquivo de configuração do Maven para o serviço de prontuário.

**O que foi feito:** Adicionada a dependência do RabbitMQ.

**Alteração:**
```xml
<!-- RabbitMQ para notificações assíncronas -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

### 4. Backend/usuarios/src/main/resources/application.properties
**O que é:** Arquivo de configuração do serviço de usuários. Define como o serviço deve se comportar.

**O que foi feito:** Adicionadas configurações para conectar ao RabbitMQ (endereço, porta, usuário e senha).

**Alteração:**
```properties
# RabbitMQ
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

### 5. Backend/pacientes/src/main/resources/application.yaml
**O que é:** Arquivo de configuração do serviço de pacientes (formato YAML).

**O que foi feito:** Adicionadas configurações para conectar ao RabbitMQ.

**Alteração:**
```yaml
# RabbitMQ
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

### 6. Backend/prontuario/src/main/resources/application.properties
**O que é:** Arquivo de configuração do serviço de prontuário.

**O que foi feito:** Adicionadas configurações para conectar ao RabbitMQ.

**Alteração:**
```properties
# RabbitMQ
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

### 7. Backend/prontuario/src/main/java/br/com/unifor/prontuario/service/ProntuarioService.java
**O que é:** Classe que contém a lógica de negócio do serviço de prontuário (o que o serviço faz).

**O que foi feito:** 
- Adicionada injeção do `ProntuarioEventProducer` (classe que envia mensagens)
- Modificado o método `atualizarAlergias` para enviar uma mensagem assíncrona quando as alergias são atualizadas

**Alteração:**
```java
// Adicionado no topo da classe
private final ProntuarioEventProducer eventProducer;

// Adicionado no método atualizarAlergias
ProntuarioEvent event = ProntuarioEvent.builder()
        .idPaciente(idPaciente)
        .tipoEvento("ALERGIAS_ATUALIZADAS")
        .descricao("Alergias atualizadas")
        .alergias(alergias)
        .dataEvento(LocalDateTime.now())
        .idUsuario(idUsuario)
        .build();
eventProducer.sendProntuarioEvent(event);
```

---

## Arquivos Criados

### 1. Backend/usuarios/src/main/java/com/br/unifor/usuarios/config/RabbitMQConfig.java
**O que é:** Classe de configuração do RabbitMQ para o serviço de usuários.

**Para que serve:** Define as filas, exchanges e bindings (como as mensagens são roteadas) do RabbitMQ.

**Explicação simples:**
- **Queue (Fila):** Onde as mensagens ficam armazenadas até serem processadas
- **Exchange (Troca):** Recebe as mensagens e as envia para as filas corretas
- **Binding (Vínculo):** Conecta a exchange à fila
- **MessageConverter:** Converte objetos Java em formato JSON para enviar pelo RabbitMQ

### 2. Backend/pacientes/src/main/java/com/br/unifor/pacientes/config/RabbitMQConfig.java
**O que é:** Classe de configuração do RabbitMQ para o serviço de pacientes.

**Para que serve:** Mesma função do arquivo acima, mas para o serviço de pacientes.

### 3. Backend/prontuario/src/main/java/br/com/unifor/prontuario/config/RabbitMQConfig.java
**O que é:** Classe de configuração do RabbitMQ para o serviço de prontuário.

**Para que serve:** Mesma função dos arquivos acima, mas para o serviço de prontuário.

### 4. Backend/prontuario/src/main/java/br/com/unifor/prontuario/dto/ProntuarioEvent.java
**O que é:** DTO (Data Transfer Object) - Classe que representa a estrutura de uma mensagem.

**Para que serve:** Define o formato da mensagem que será enviada quando algo acontece no prontuário.

**Campos:**
- `idPaciente`: ID do paciente
- `tipoEvento`: Tipo do evento (ex: "ALERGIAS_ATUALIZADAS")
- `descricao`: Descrição do evento
- `alergias`: Lista de alergias (quando aplicável)
- `dataEvento`: Data e hora do evento
- `idUsuario`: ID do usuário que fez a ação

### 5. Backend/prontuario/src/main/java/br/com/unifor/prontuario/mq/ProntuarioEventProducer.java
**O que é:** Classe produtora de mensagens.

**Para que serve:** Envia mensagens para o RabbitMQ quando algo acontece no prontuário.

**Como funciona:**
- Recebe um objeto `ProntuarioEvent`
- Usa o `AmqpTemplate` para enviar a mensagem para a exchange correta
- A mensagem é roteada para a fila apropriada

### 6. Backend/pacientes/src/main/java/com/br/unifor/pacientes/dto/ProntuarioEvent.java
**O que é:** DTO para o serviço de pacientes (mesma estrutura do arquivo do prontuário).

**Para que serve:** Permite que o serviço de pacientes entenda as mensagens recebidas do prontuário.

### 7. Backend/pacientes/src/main/java/com/br/unifor/pacientes/mq/ProntuarioEventConsumer.java
**O que é:** Classe consumidora de mensagens.

**Para que serve:** Recebe mensagens do RabbitMQ e processa-as.

**Como funciona:**
- O método `handleProntuarioEvent` é chamado automaticamente quando uma mensagem chega na fila
- Verifica o tipo do evento
- Se for "ALERGIAS_ATUALIZADAS", busca o paciente no banco e atualiza suas alergias
- Registra logs para acompanhar o processamento

---

## Como funciona o fluxo completo?

1. **Usuário atualiza alergias no prontuário**
   - Frontend faz uma requisição para o serviço de prontuário
   - O método `atualizarAlergias` do `ProntuarioService` é chamado

2. **Prontuário atualiza o banco de dados**
   - As alergias são salvas no MongoDB

3. **Prontuário envia mensagem assíncrona**
   - Um objeto `ProntuarioEvent` é criado com os dados da atualização
   - O `ProntuarioEventProducer` envia a mensagem para o RabbitMQ
   - O prontuário continua sem esperar a resposta (não bloqueia)

4. **RabbitMQ recebe a mensagem**
   - A mensagem fica na fila `prontuario.queue`

5. **Serviço de pacientes consome a mensagem**
   - O `ProntuarioEventConsumer` recebe a mensagem automaticamente
   - Verifica que é um evento de "ALERGIAS_ATUALIZADAS"
   - Busca o paciente no PostgreSQL
   - Atualiza as alergias do paciente
   - Salva no banco

6. **Dados sincronizados**
   - Agora o prontuário e o serviço de pacientes têm as mesmas alergias para o paciente

---

## Benefícios dessa implementação

1. **Desacoplamento:** Os serviços não dependem diretamente um do outro. Se um serviço cair, o outro continua funcionando e as mensagens ficam na fila.

2. **Assincronismo:** O serviço de prontuário não precisa esperar o serviço de pacientes responder. A resposta é mais rápida para o usuário.

3. **Escalabilidade:** Se precisar processar muitas mensagens, pode ter múltiplos consumidores rodando em paralelo.

4. **Resiliência:** Se o serviço de pacientes estiver indisponível, as mensagens ficam na fila e serão processadas quando ele voltar.

---

## Próximos passos para testar

1. **Instalar RabbitMQ**
   - Baixar e instalar o RabbitMQ em https://www.rabbitmq.com/download.html
   - Iniciar o serviço RabbitMQ

2. **Compilar os serviços**
   - Os serviços precisam baixar as novas dependências do RabbitMQ
   - Executar `mvn clean install` nos serviços Maven (usuarios, prontuario)
   - Executar `gradle clean build` no serviço Gradle (pacientes)

3. **Iniciar os serviços**
   - Iniciar PostgreSQL e MongoDB
   - Iniciar os 3 serviços backend (usuarios, pacientes, prontuario)
   - Iniciar o RabbitMQ

4. **Testar**
   - Fazer uma requisição para atualizar alergias no prontuário
   - Verificar no log do serviço de pacientes que a mensagem foi recebida
   - Verificar no banco PostgreSQL que as alergias foram atualizadas

---

## Termos técnicos explicados

- **RabbitMQ:** Sistema de mensageria que permite que aplicações se comuniquem de forma assíncrona
- **Fila (Queue):** Local onde as mensagens ficam armazenadas até serem processadas
- **Exchange:** Componente que recebe mensagens e as envia para as filas apropriadas
- **Binding:** Regra que conecta uma exchange a uma fila
- **Producer (Produtor):** Aplicação que envia mensagens
- **Consumer (Consumidor):** Aplicação que recebe e processa mensagens
- **DTO (Data Transfer Object):** Objeto usado para transferir dados entre camadas da aplicação
- **Assíncrono:** Operação que não bloqueia a execução do programa enquanto espera resposta
- **Maven/Gradle:** Ferramentas para gerenciar dependências e construir projetos Java
- **Spring Boot:** Framework Java que facilita a criação de aplicações
- **Microserviços:** Arquitetura onde uma aplicação é dividida em pequenos serviços independentes

---

## 🚀 Guia Rápido de Execução e Testes

Siga estes passos em ordem para rodar o projeto completo e validar a mensageria assíncrona.

### 1. Preparar a Infraestrutura (Docker)
Em um terminal, execute os comandos para garantir que os bancos e o RabbitMQ estão rodando:

```powershell
# Subir RabbitMQ (Admin: http://localhost:15672 | guest/guest)
docker start rabbitmq-healthsys || docker run -d --name rabbitmq-healthsys -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Subir Postgres
docker start postgres-healthsys || docker run -d --name postgres-healthsys -e POSTGRES_USER=wadson -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=healthsys_usuarios -p 5432:5432 postgres:15

# Subir MongoDB
docker start mongodb-healthsys || docker run -d --name mongodb-healthsys -p 27017:27017 mongo:6

# Criar o banco de dados de Pacientes (Necessário uma única vez)
docker exec -it postgres-healthsys psql -U wadson -d postgres -c "CREATE DATABASE healthsys_pacientes;"
```

### 2. Iniciar os Microserviços
Abra **três terminais** diferentes e rode cada comando em sua respectiva pasta:

*   **Terminal 1 (Usuários - Porta 8081):**
    ```powershell
    cd Backend/usuarios; .\mvnw spring-boot:run
    ```
*   **Terminal 2 (Pacientes - Porta 8082):**
    ```powershell
    cd Backend/pacientes; .\gradlew bootRun
    ```
*   **Terminal 3 (Prontuário - Porta 8083):**
    ```powershell
    cd Backend/prontuario; .\mvnw spring-boot:run
    ```

---

### 3. Teste de Mensageria (Sincronização de Alergias)
Com os serviços rodando, abra um **quarto terminal** para executar os testes de integração:

#### A. Criar um Paciente (Serviço de Pacientes)
Cria um paciente inicial sem alergias:
```powershell
curl.exe -X POST http://localhost:8082/pacientes `
  -H "Content-Type: application/json" `
  -d '{"nome": "Ricardo Teste", "dataNascimento": "29/04/1990", "cpf": "123.456.789-00", "sexo": "MASCULINO", "telefone": "85999999999"}'
```

#### B. Atualizar Alergias (Serviço de Prontuário)
Isso vai disparar um evento assíncrono via RabbitMQ:
```powershell
curl.exe -X POST http://localhost:8083/prontuarios/1/alergias `
  -H "Content-Type: application/json" `
  -d '["Dipirona", "Amoxicilina"]'
```

#### C. Verificar Sincronização (Serviço de Pacientes)
Confirme se o cadastro do paciente foi atualizado automaticamente:
```powershell
curl.exe http://localhost:8082/pacientes/1
```

---
*Documentação atualizada em 29/04/2026 por Antigravity AI.*
