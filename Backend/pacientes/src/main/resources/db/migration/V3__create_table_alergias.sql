CREATE TABLE paciente_alergia (
    paciente_id BIGINT NOT NULL,
    alergia VARCHAR(100) NOT NULL,

    CONSTRAINT fk_paciente_alergia FOREIGN KEY (paciente_id) REFERENCES paciente(id) ON DELETE CASCADE
);