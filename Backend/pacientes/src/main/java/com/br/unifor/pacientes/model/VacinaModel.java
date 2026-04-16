package com.br.unifor.pacientes.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vacina")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacinaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da vacina é obrigatório")
    @Column(name = "nome_vacina", nullable = false)
    private String nomeVacina;

    @NotNull(message = "A data de aplicação é obrigatória")
    @PastOrPresent(message = "A data de aplicação não pode ser no futuro")
    @Column(name = "data_aplicacao", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataAplicacao;

    private String fabricante;

    private String lote;

    private String dose; // "D1", "D2", "Reforço"

    @Column(name = "proxima_dose")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate proximaDose;

    @CreationTimestamp
    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "registrado_por")
    private String registradoPor;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    @JsonBackReference
    private PacienteModel paciente;
}

