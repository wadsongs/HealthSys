package com.br.unifor.pacientes.controller;

import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@Tag(name = "Pacientes", description = "Endpoints para gerenciamento de pacientes")
@RequestMapping("/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService service;

    //Endpoint para criar um novo paciente
    @PostMapping
    @Operation(summary = "Cadastrar um novo paciente", description = "Salva um novo paciente no banco de dados.")
    @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso")
    public ResponseEntity<PacienteModel> criar(@Valid @RequestBody PacienteModel paciente) {
        PacienteModel pacienteSalvo = service.salvar(paciente);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteSalvo);
    }

    //Endpoint para listar todos
    @GetMapping
    @Operation(summary = "Listar todos os pacientes")
    public ResponseEntity<List<PacienteModel>> listarTodos() {
        List<PacienteModel> pacientes = service.listarTodos();
        return ResponseEntity.ok(pacientes);
    }

    //Endpoint busca por ID
    @GetMapping("/{id}")
    @Operation(summary = "Buscar paciente por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente encontrado"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<PacienteModel> buscarPorId(@PathVariable Long id) {
        Optional<PacienteModel> paciente = service.buscarPorId(id);

        return paciente.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //Endpoint delete por ID
    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar um paciente", description = "Remove o paciente pelo seu ID.")
    @ApiResponse(responseCode = "204", description = "Paciente deletado com sucesso")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build(); //Retorna 204
    }
}
