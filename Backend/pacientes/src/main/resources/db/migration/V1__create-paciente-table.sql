CREATE TABLE IF NOT EXISTS paciente (
    id               BIGSERIAL PRIMARY KEY,
    nome             VARCHAR(255) NOT NULL,
    data_nascimento  DATE         NOT NULL,
    cpf              VARCHAR(14)  NOT NULL UNIQUE,
    email            VARCHAR(255) UNIQUE,
    sexo             VARCHAR(20)  NOT NULL,
    telefone         VARCHAR(15)  NOT NULL,
    data_cadastro    TIMESTAMP,
    data_atualizacao TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS paciente_alergia (
    paciente_id BIGINT       NOT NULL REFERENCES paciente(id),
    alergia                  VARCHAR(255) NOT NULL
    );

CREATE TABLE IF NOT EXISTS vacina (
    id              BIGSERIAL PRIMARY KEY,
    nome_vacina     VARCHAR(255) NOT NULL,
    data_aplicacao  DATE         NOT NULL,
    fabricante      VARCHAR(255),
    lote            VARCHAR(100),
    dose            VARCHAR(50),
    proxima_dose    DATE,
    data_cadastro   TIMESTAMP,
    registrado_por  VARCHAR(255),
    paciente_id     BIGINT NOT NULL REFERENCES paciente(id)
    );