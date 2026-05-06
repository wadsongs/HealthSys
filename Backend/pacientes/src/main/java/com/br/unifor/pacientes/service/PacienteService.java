package com.br.unifor.pacientes.service;

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
import org.springframework.transaction.annotation.Transactional; // Import adicionado

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository repository;
    private final com.br.unifor.pacientes.mq.PacienteEventProducer eventProducer;

    @Transactional
    public PacienteModel criar(PacienteModel paciente) {
        if (repository.existsByCpf(paciente.getCpf())) {
            throw new RuntimeException("CPF já cadastrado: " + paciente.getCpf());
        }
        PacienteModel salvo = repository.save(paciente);

        // Enviar evento de criação
        eventProducer.sendPacienteCriadoEvent(com.br.unifor.pacientes.dto.ProntuarioEvent.builder()
                .idPaciente(salvo.getId())
                .tipoEvento("PACIENTE_CRIADO")
                .descricao("Novo paciente cadastrado: " + salvo.getNome())
                .dataEvento(java.time.LocalDateTime.now())
                .build());

        return salvo;
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "pacientes", key = "#id"),
            @CacheEvict(value = "pacientes-cpf", allEntries = true)
    })
    public PacienteModel atualizar(Long id, PacienteModel dados) {
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

        // Atualiza a lista, mas não precisamos dar .size() aqui pois
        // o retorno do save geralmente não sofre do erro imediato, mas por segurança
        // a boa prática em DTOs resolveria. O Spring Data cuidará do cascade aqui.
        existente.setAlergias(dados.getAlergias());

        return repository.save(existente);
    }

    @Transactional(readOnly = true)
    public Page<PacienteModel> listarTodos(Pageable pageable) {
        Page<PacienteModel> pagina = repository.findAll(pageable);

        // SOLUÇÃO DO LAZY EXCEPTION PARA PAGINAÇÃO:
        // Força a busca das alergias enquanto a sessão do banco ainda está aberta
        pagina.forEach(paciente -> {
            if (paciente.getAlergias() != null) {
                paciente.getAlergias().size();
            }
        });

        return pagina;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "pacientes", key = "#id")
    public PacienteModel buscarPorId(Long id) {
        PacienteModel paciente = buscarPorIdOuFalhar(id);

        // SOLUÇÃO DO LAZY EXCEPTION PARA BUSCA ÚNICA (E PARA O CACHE NÃO QUEBRAR):
        if (paciente.getAlergias() != null) {
            paciente.getAlergias().size();
        }

        return paciente;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "pacientes-cpf", key = "#cpf")
    public PacienteModel buscarPorCpf(String cpf) {
        PacienteModel paciente = repository.findByCpf(cpf)
                .orElseThrow(() -> new PacienteNotFoundException(cpf));

        // SOLUÇÃO DO LAZY EXCEPTION:
        if (paciente.getAlergias() != null) {
            paciente.getAlergias().size();
        }

        return paciente;
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