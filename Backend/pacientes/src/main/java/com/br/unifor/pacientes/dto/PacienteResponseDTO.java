package com.br.unifor.pacientes.dto;

import com.br.unifor.pacientes.model.PacienteModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList; // <-- Import necessário
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteResponseDTO {

    private Long id;
    private String nome;
    private String cpf;
    private LocalDate dataNascimento;
    private String email;
    private String telefone;
    private List<String> alergias;

    public static PacienteResponseDTO fromModel(PacienteModel model) {
        return PacienteResponseDTO.builder()
                .id(model.getId())
                .nome(model.getNome())
                .cpf(model.getCpf())
                .dataNascimento(model.getDataNascimento())
                .email(model.getEmail())
                .telefone(model.getTelefone())
                .alergias(model.getAlergias() != null ? new ArrayList<>(model.getAlergias()) : new ArrayList<>())
                .build();
    }
}