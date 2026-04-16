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
public class Exame {

    @NotBlank(message = "O nome do exame é obrigatório")
    private String nome;

    @NotNull(message = "O ID do solicitante é obrigatório")
    private Long idSolicitante;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Data da solicitação gerada automaticamente")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime dataSolicitacao = LocalDateTime.now();

    private String resultado;

    @Schema(example = "10/04/2026 16:00", type = "string", description = "Data de quando o resultado foi liberado")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime dataResultado;
}
