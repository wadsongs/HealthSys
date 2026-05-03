package com.br.unifor.triagem.model;

import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "triagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriagemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "O ID do paciente é obrigatório")
    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @NotBlank(message = "O nome do paciente é obrigatório")
    @Column(name = "nome_paciente", nullable = false)
    private String nomePaciente;

    @NotNull(message = "O nível de risco é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_risco", nullable = false)
    private NivelRisco nivelRisco;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusTriagem status = StatusTriagem.AGUARDANDO;

    @Column(columnDefinition = "TEXT")
    private String sintomas;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_hora_entrada")
    private LocalDateTime dataHoraEntrada;

    @Column(name = "data_hora_atendimento")
    private LocalDateTime dataHoraAtendimento;

    @CreationTimestamp
    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
}
