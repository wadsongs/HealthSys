package com.br.unifor.pacientes.exception;

public class PacienteNotFoundException extends RuntimeException {

    public PacienteNotFoundException(Long id) {
        super("Paciente não encontrado com ID: " + id);
    }

    public PacienteNotFoundException(String cpf) {
        super("Paciente não encontrado com CPF: " + cpf);
    }
}