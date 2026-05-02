package com.br.unifor.triagem.dto;

import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TriagemRequest {

    @NotNull(message = "O ID do paciente é obrigatório")
    private Long pacienteId;

    @NotBlank(message = "O nome do paciente é obrigatório")
    private String nomePaciente;

    @NotNull(message = "O nível de risco é obrigatório")
    private NivelRisco nivelRisco;

    private StatusTriagem status;
    private String sintomas;
    private String observacoes;
}
