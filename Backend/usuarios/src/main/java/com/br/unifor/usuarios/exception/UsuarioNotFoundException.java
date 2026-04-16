package com.br.unifor.usuarios.exception;

public class UsuarioNotFoundException extends RuntimeException {

    public UsuarioNotFoundException(Long id) {
        super("Usuário não encontrado com o ID: " + id);
    }

    public UsuarioNotFoundException(String email) {

        super("Usuário não encontrado com o e-mail: " + email);
    }
}
