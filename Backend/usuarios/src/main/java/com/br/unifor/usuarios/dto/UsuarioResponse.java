package com.br.unifor.usuarios.dto;

import com.br.unifor.usuarios.model.UsuarioModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nome;
    private String email;
    private UsuarioModel.Perfil perfil;
    private boolean ativo;
    private LocalDateTime dataCadastro;
}
