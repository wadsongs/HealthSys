CREATE TABLE triagem (
    id                    BIGSERIAL    PRIMARY KEY,
    paciente_id           BIGINT       NOT NULL,
    nome_paciente         VARCHAR(255) NOT NULL,
    nivel_risco           VARCHAR(20)  NOT NULL,
    status                VARCHAR(30)  NOT NULL DEFAULT 'AGUARDANDO',
    sintomas              TEXT,
    observacoes           TEXT,
    data_hora_entrada     TIMESTAMP,
    data_hora_atendimento TIMESTAMP,
    data_cadastro         TIMESTAMP,
    data_atualizacao      TIMESTAMP
);

CREATE INDEX idx_triagem_paciente_id ON triagem(paciente_id);
CREATE INDEX idx_triagem_status      ON triagem(status);
CREATE INDEX idx_triagem_nivel_risco ON triagem(nivel_risco);
