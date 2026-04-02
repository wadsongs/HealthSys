package com.br.unifor.pacientes.controller;

import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService service;

    //Endpoint para criar um novo paciente
    @PostMapping
    public ResponseEntity<PacienteModel> criar(@RequestBody PacienteModel paciente) {
        PacienteModel pacienteSalvo = service.salvar(paciente);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteSalvo);
    }

    //Endpoint para listar todos
    @GetMapping
    public ResponseEntity<List<PacienteModel>> listarTodos() {
        List<PacienteModel> pacientes = service.listarTodos();
        return ResponseEntity.ok(pacientes);
    }

    //Endpoint busca por ID
    @GetMapping("/{id}")
    public ResponseEntity<PacienteModel> buscarPorId(@PathVariable Long id) {
        Optional<PacienteModel> paciente = service.buscarPorId(id);

        return paciente.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //Endpoint delete por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build(); //Retorna 204
    }
}
