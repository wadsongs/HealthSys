package com.br.unifor.pacientes.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "paciente")
@NoArgsConstructor
@AllArgsConstructor
public class PacienteModel {

    @Id
    @GeneratedValue()
    private Long id;
    private String nome;
    private String dataNascimento;
    private String cpf;
    private String sexo;
    private String telefone;

}
