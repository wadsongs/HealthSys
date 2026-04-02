package com.br.unifor.pacientes.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "vacina")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VacinaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_vacina", nullable = false)
    private String nomeVacina;

    @Column(name = "data_aplicacao", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataAplicacao;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false) // Chave estrangeira no banco
    @JsonBackReference // Evita o loop infinito na hora de gerar o JSON
    private PacienteModel paciente;
}
