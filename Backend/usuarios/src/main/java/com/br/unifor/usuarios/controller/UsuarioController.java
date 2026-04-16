package com.br.unifor.usuarios.controller;

import com.br.unifor.usuarios.dto.UsuarioRequest;
import com.br.unifor.usuarios.dto.UsuarioResponse;
import com.br.unifor.usuarios.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Gerenciamento de Usuários do sistema")
@SecurityRequirement(name = "Bearer Auth")
public class UsuarioController {

    private final UsuarioService service;

    @Operation(summary = "Cadastrar usuário", description = "Apenas administradores podem cadastrar")
    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrar(@RequestBody @Valid UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(request));
    }

    // Listar todos
    @Operation(summary = "Listar usuários")
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // Buscar por ID
    @Operation(summary = "Buscar usuário por ID")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // Atualizar usuário(para apenas adm)
    @Operation(summary = "Atualizar usuário", description = "Apenas administradores podem atualizar")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(@PathVariable Long id, @RequestBody @Valid UsuarioRequest request) {
        return ResponseEntity.ok(service.atualizar(id,request));
    }

    // Desativar usuário
    @Operation(summary = "Desativar usuário", description = "Desativa o usuário sem removê-lo do banco")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        service.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
