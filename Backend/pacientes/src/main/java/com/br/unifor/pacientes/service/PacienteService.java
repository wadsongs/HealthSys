package com.br.unifor.pacientes.service;

import com.br.unifor.pacientes.dto.PacienteResponseDTO;
import com.br.unifor.pacientes.exception.PacienteNotFoundException;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository repository;
    private final com.br.unifor.pacientes.mq.PacienteEventProducer eventProducer;

    @Transactional
    public PacienteResponseDTO criar(PacienteModel paciente) {
        if (repository.existsByCpf(paciente.getCpf())) {
            throw new RuntimeException("CPF já cadastrado: " + paciente.getCpf());
        }
        PacienteModel salvo = repository.save(paciente);

        eventProducer.sendPacienteCriadoEvent(com.br.unifor.pacientes.dto.ProntuarioEvent.builder()
                .idPaciente(salvo.getId())
                .tipoEvento("PACIENTE_CRIADO")
                .descricao("Novo paciente cadastrado: " + salvo.getNome())
                .dataEvento(java.time.LocalDateTime.now())
                .build());

        return PacienteResponseDTO.fromModel(salvo);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "pacientes", key = "#id"),
            @CacheEvict(value = "pacientes-cpf", allEntries = true)
    })
    public PacienteResponseDTO atualizar(Long id, PacienteModel dados) {
        PacienteModel existente = buscarPorIdOuFalhar(id);

        if (!existente.getCpf().equals(dados.getCpf())
                && repository.existsByCpf(dados.getCpf())) {
            throw new RuntimeException("CPF já cadastrado: " + dados.getCpf());
        }

        existente.setNome(dados.getNome());
        existente.setDataNascimento(dados.getDataNascimento());
        existente.setCpf(dados.getCpf());
        existente.setEmail(dados.getEmail());
        existente.setSexo(dados.getSexo());
        existente.setTelefone(dados.getTelefone());
        existente.setAlergias(dados.getAlergias());

        PacienteModel atualizado = repository.save(existente);
        return PacienteResponseDTO.fromModel(atualizado);
    }

    @Transactional(readOnly = true)
    public Page<PacienteResponseDTO> listarTodos(Pageable pageable) {
        return repository.findAll(pageable).map(PacienteResponseDTO::fromModel);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "pacientes", key = "#id")
    public PacienteResponseDTO buscarPorId(Long id) {
        PacienteModel paciente = buscarPorIdOuFalhar(id);
        return PacienteResponseDTO.fromModel(paciente);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "pacientes-cpf", key = "#cpf")
    public PacienteResponseDTO buscarPorCpf(String cpf) {
        PacienteModel paciente = repository.findByCpf(cpf)
                .orElseThrow(() -> new PacienteNotFoundException(cpf));
        return PacienteResponseDTO.fromModel(paciente);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "pacientes", key = "#id"),
            @CacheEvict(value = "pacientes-cpf", allEntries = true)
    })
    public void deletar(Long id) {
        buscarPorIdOuFalhar(id);
        repository.deleteById(id);
    }

    private PacienteModel buscarPorIdOuFalhar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));
    }
}