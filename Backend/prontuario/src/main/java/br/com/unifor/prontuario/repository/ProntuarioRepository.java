package br.com.unifor.prontuario.repository;

import br.com.unifor.prontuario.model.ProntuarioModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProntuarioRepository extends MongoRepository<ProntuarioModel, String> {

    // Busca pelo ID do paciente (vindo do serviço de pacientes)
    Optional<ProntuarioModel> findByIdPaciente(Long idPaciente);

    // Verifica se já existe prontuário para esse paciente
    boolean existsByIdPaciente(Long idPaciente);
}
