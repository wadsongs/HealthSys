package com.br.unifor.usuarios.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RealtimeNotificationDto {

    private String id;
    private String tipoEvento;
    private String descricao;
    private Long idPaciente;
    /** ISO-8601 (LocalDateTime#toString) */
    private String dataEvento;
}
