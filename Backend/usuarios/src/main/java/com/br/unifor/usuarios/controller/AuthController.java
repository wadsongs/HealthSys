package com.br.unifor.usuarios.controller;

import com.br.unifor.usuarios.dto.LoginRequest;
import com.br.unifor.usuarios.dto.LoginResponse;
import com.br.unifor.usuarios.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Login e geração de token JWT")
public class AuthController {

    private final UsuarioService service;

    // Login com email e senha retorna JWT
    @Operation
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {

        return ResponseEntity.ok(service.login(request));
    }
}
