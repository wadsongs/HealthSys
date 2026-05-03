package com.br.unifor.triagem.exception;

public class TriagemNotFoundException extends RuntimeException {

    public TriagemNotFoundException(Long id) {
        super("Triagem não encontrada com o ID: " + id);
    }
}
