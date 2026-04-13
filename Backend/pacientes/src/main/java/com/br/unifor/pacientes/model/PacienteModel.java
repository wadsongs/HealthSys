package com.br.unifor.pacientes.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paciente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotNull(message = "A data de nascimento é obrigatória")
    @PastOrPresent(message = "A data de nascimento não pode ser no futuro")
    @Column(name = "data_nascimento", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataNascimento;

    @NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "CPF em formato inválido")
    @Column(unique = true, nullable = false)
    private String cpf;

    @Email(message = "E-mail inválido")
    @Column(unique = true)
    private String email;

    @NotNull(message = "O sexo é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sexo sexo;

    @NotBlank(message = "O telefone é obrigatório")
    @Size(min = 10, max = 15, message = "Telefone inválido")
    @Column(nullable = false)
    private String telefone;

    @CreationTimestamp
    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "paciente_alergia", joinColumns = @JoinColumn(name = "paciente_id"))
    @Column(name = "alergia")
    private List<String> alergias = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<VacinaModel> vacinas = new ArrayList<>();

    public enum Sexo { MASCULINO, FEMININO, OUTRO }
}