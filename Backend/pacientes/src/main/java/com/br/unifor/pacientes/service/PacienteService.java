package com.br.unifor.pacientes.service;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository repository;

    //Criar ou atualizar um paciente
    public PacienteModel salvar(PacienteModel paciente) {
        return repository.save(paciente);
    }

    //Listar todos os pacientes
    public List<PacienteModel> listarTodos() {
        return repository.findAll();
    }

    //Buscar paciente por ID
    public Optional<PacienteModel> buscarPorId(Long id) {
        return repository.findById(id);
    }

    //Deletar por ID
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}