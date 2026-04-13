package com.br.unifor.pacientes.service;

import com.br.unifor.pacientes.exception.PacienteNotFoundException;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository repository;

    // Criar paciente
    public PacienteModel criar(PacienteModel paciente) {
        if (repository.existsByCpf(paciente.getCpf())) {
            throw new RuntimeException("CPF já cadastrado: " + paciente.getCpf());
        }
        return repository.save(paciente);
    }

    // Atualizar paciente
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
        existente.setAlergias(dados.getAlergias());

        return repository.save(existente);
    }

    // Listar com paginação
    public Page<PacienteModel> listarTodos(Pageable pageable) {
        return repository.findAll(pageable);
    }

    // Buscar por ID
    public PacienteModel buscarPorId(Long id) {
        return buscarPorIdOuFalhar(id);
    }

    // Buscar por CPF
    public PacienteModel buscarPorCpf(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new PacienteNotFoundException(cpf));
    }

    // Deletar
    public void deletar(Long id) {
        buscarPorIdOuFalhar(id);
        repository.deleteById(id);
    }

    private PacienteModel buscarPorIdOuFalhar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));
    }
}