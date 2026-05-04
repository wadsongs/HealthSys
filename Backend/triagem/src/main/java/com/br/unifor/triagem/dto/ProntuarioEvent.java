package com.br.unifor.triagem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** Payload JSON compatível com o consumidor de notificações em `usuarios`. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProntuarioEvent {
    private Long idPaciente;
    private String tipoEvento;
    private String descricao;
    private List<String> alergias;
    private LocalDateTime dataEvento;
    private Long idUsuario;
}
