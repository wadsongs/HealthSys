package com.br.unifor.triagem.controller;

import com.br.unifor.triagem.dto.TriagemRequest;
import com.br.unifor.triagem.dto.TriagemResponse;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import com.br.unifor.triagem.service.TriagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/triagens")
@RequiredArgsConstructor
@Tag(name = "Triagem", description = "Gerenciamento de Triagens — Protocolo de Manchester")
@SecurityRequirement(name = "Bearer Auth")
public class TriagemController {

    private final TriagemService service;

    @Operation(summary = "Registrar triagem", description = "Inicia nova triagem com status AGUARDANDO.")
    @ApiResponse(responseCode = "201", description = "Triagem criada com sucesso")
    @PostMapping
    public ResponseEntity<TriagemResponse> criar(@RequestBody @Valid TriagemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @Operation(summary = "Listar triagens com paginação")
    @GetMapping
    public ResponseEntity<Page<TriagemResponse>> listarTodos(Pageable pageable) {
        return ResponseEntity.ok(service.listarTodos(pageable));
    }

    @Operation(summary = "Buscar triagem por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Triagem encontrada"),
            @ApiResponse(responseCode = "404", description = "Triagem não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TriagemResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Listar triagens de um paciente")
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<TriagemResponse>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(service.listarPorPaciente(pacienteId));
    }

    @Operation(summary = "Listar triagens por status")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TriagemResponse>> listarPorStatus(@PathVariable StatusTriagem status) {
        return ResponseEntity.ok(service.listarPorStatus(status));
    }

    @Operation(summary = "Atualizar triagem")
    @PutMapping("/{id}")
    public ResponseEntity<TriagemResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid TriagemRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @Operation(summary = "Atualizar apenas o status da triagem")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TriagemResponse> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusTriagem status) {
        return ResponseEntity.ok(service.atualizarStatus(id, status));
    }

    @Operation(summary = "Remover triagem")
    @ApiResponse(responseCode = "204", description = "Triagem removida com sucesso")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
