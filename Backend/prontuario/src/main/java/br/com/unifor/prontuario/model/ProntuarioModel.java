package br.com.unifor.prontuario.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "prontuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProntuarioModel {

    @Id
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String id;

    @Indexed(unique = true)
    private Long idPaciente;

    @CreatedDate
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime dataCriacao;

    @LastModifiedDate
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime dataAtualizacao;

    private List<String> alergias = new ArrayList<>();

    private List<Consulta> consultas = new ArrayList<>();

    private List<Exame> exames = new ArrayList<>();

    private List<Medicamento> medicamentos = new ArrayList<>();

    private List<LogAuditoria> logs = new ArrayList<>();
}
