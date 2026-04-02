package com.br.unifor.pacientes.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paciente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PacienteModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome não pode ficar em branco")
    private String nome;


    @NotNull(message = "A data de nascimento é obrigatória")
    @PastOrPresent(message = "A data de nascimento não pode ser no futuro")
    @Column(name = "data_nascimento")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataNascimento;

    @NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "CPF em formato inválido")
    @Column(unique = true)
    private String cpf;

    @NotBlank(message = "O sexo é obrigatório")
    private String sexo;

    @NotBlank(message = "O telefone é obrigatório")
    private String telefone;

    @ElementCollection
    @CollectionTable(name = "paciente_alergia", joinColumns = @JoinColumn(name = "paciente_id"))
    @Column(name = "alergia")
    private List<String> alergias = new ArrayList<>();

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<VacinaModel> vacinas = new ArrayList<>();

}
