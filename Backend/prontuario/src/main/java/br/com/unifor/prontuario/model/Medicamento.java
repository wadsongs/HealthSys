package br.com.unifor.prontuario.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class Medicamento {

    @NotBlank(message = "O nome do medicamento é obrigatório")
    private String nome;

    @NotBlank(message = "A dosagem é obrigatória")
    private String dosagem;

    @NotBlank(message = "A frequência é obrigatória")
    private String frequencia;

    // RN03 — só médico prescreve (validado no controller via perfil JWT futuramente)
    @NotNull(message = "O ID do prescritor é obrigatório")
    private Long idPrescritor;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Data da prescrição (Gerada automaticamente)")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime dataPrescricao = LocalDateTime.now();
}
