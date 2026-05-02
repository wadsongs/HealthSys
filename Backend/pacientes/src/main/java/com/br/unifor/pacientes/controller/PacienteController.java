package com.br.unifor.pacientes.controller;

import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "Gerenciamento de Pacientes")
@SecurityRequirement(name = "Bearer Auth")

public class PacienteController {

    private final PacienteService service;

    // Cadastrar paciente
    @Operation(summary = "Cadastrar paciente", description = "Salva um novo paciente no banco de dados.")
    @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso")
    @PostMapping
    public ResponseEntity<PacienteModel> criar(@RequestBody @Valid PacienteModel paciente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(paciente));
    }

    // Listar todos com paginação
    @Operation(summary = "Listar pacientes")
    @GetMapping
    public ResponseEntity<Page<PacienteModel>> listarTodos(Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(service.listarTodos(pageable));
    }

    // Buscar por ID
    @Operation(summary = "Buscar paciente por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente encontrado"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PacienteModel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // Buscar por CPF
    @Operation(summary = "Buscar paciente por CPF")
    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<PacienteModel> buscarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(service.buscarCpf(cpf));
    }

    // Atualizar — RF01
    @Operation(summary = "Atualizar paciente")
    @PutMapping("/{id}")
    public ResponseEntity<PacienteModel> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid PacienteModel paciente) {
        return ResponseEntity.ok(service.atualizar(id, paciente));
    }

    // Deletar
    @Operation(summary = "Deletar paciente", description = "Remove o paciente pelo seu ID.")
    @ApiResponse(responseCode = "204", description = "Paciente deletado com sucesso")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
