CREATE TABLE paciente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    dataNascimento VARCHAR(12) NOT NULL,
    cpf VARCHAR(20) NOT NULL UNIQUE ,
    sexo VARCHAR(20) NOT NULL,
    telefone VARCHAR(20)
)