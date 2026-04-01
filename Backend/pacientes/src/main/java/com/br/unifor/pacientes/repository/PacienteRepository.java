package com.br.unifor.pacientes.repository;

import com.br.unifor.pacientes.model.PacienteModel;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<PacienteModel, Id> {


}
