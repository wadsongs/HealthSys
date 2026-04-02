CREATE TABLE vacina (
    id SERIAL PRIMARY KEY,
    nome_vacina VARCHAR(100) NOT NULL,
    data_aplicacao DATE NOT NULL,
    paciente_id BIGINT NOT NULL,

    CONSTRAINT fk_paciente FOREIGN KEY (paciente_id) REFERENCES paciente(id) ON DELETE CASCADE
);