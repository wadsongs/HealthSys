package com.br.unifor.pacientes.repository;

import com.br.unifor.pacientes.model.PacienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<PacienteModel, Long> {
    Optional<PacienteModel> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}