package com.br.unifor.triagem.repository;

import com.br.unifor.triagem.model.TriagemModel;
import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TriagemRepository extends JpaRepository<TriagemModel, Long> {
    List<TriagemModel> findByPacienteId(Long pacienteId);
    List<TriagemModel> findByStatus(StatusTriagem status);
    List<TriagemModel> findByNivelRisco(NivelRisco nivelRisco);
}
