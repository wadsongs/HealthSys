package com.br.unifor.triagem.dto;

import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriagemResponse {

    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private NivelRisco nivelRisco;
    private String descricaoRisco;
    private StatusTriagem status;
    private String sintomas;
    private String observacoes;
    private LocalDateTime dataHoraEntrada;
    private LocalDateTime dataHoraAtendimento;
    private LocalDateTime dataCadastro;
}
