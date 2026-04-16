package br.com.unifor.prontuario.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consulta {

    @NotNull(message = "O ID do médico é obrigatório")
    private Long idMedico;

    @NotBlank(message = "O tipo de atendimento é obrigatório")
    private String tipoAtendimento; // "CONSULTA", "RETORNO", "EMERGENCIA"

    @NotBlank(message = "O diagnóstico é obrigatório")
    private String diagnostico;

    private String observacoes;

    @Schema(example = "07/04/2026 14:30", type = "string", description = "Data e hora da consulta")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime dataHora = LocalDateTime.now();
}
