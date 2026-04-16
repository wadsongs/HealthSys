package br.com.unifor.prontuario.exception;

public class ProntuarioNotFoundException extends RuntimeException {
    public ProntuarioNotFoundException(Long idPaciente) {
        super("Prontuário não encontrado para o paciente " + idPaciente);
    }
}
