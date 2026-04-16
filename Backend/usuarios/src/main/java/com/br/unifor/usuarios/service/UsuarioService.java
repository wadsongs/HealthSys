package com.br.unifor.usuarios.service;

import com.br.unifor.usuarios.dto.LoginRequest;
import com.br.unifor.usuarios.dto.LoginResponse;
import com.br.unifor.usuarios.dto.UsuarioRequest;
import com.br.unifor.usuarios.dto.UsuarioResponse;
import com.br.unifor.usuarios.exception.UsuarioNotFoundException;
import com.br.unifor.usuarios.model.UsuarioModel;
import com.br.unifor.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // Login
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        UsuarioModel usuario = buscarPorEmailOuFalhar(request.getEmail());
        String token = jwtService.gerarToken(usuario);

        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .perfil(usuario.getPerfil().name())
                .build();
    }

    // Cadastrar Usuário
    public UsuarioResponse cadastrar(UsuarioRequest request) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado: " + request.getEmail());
        }

        UsuarioModel usuario = UsuarioModel.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .perfil(request.getPerfil())
                .ativo(true)
                .build();

        return toResponse(repository.save(usuario));
    }

    // Listar todos — RF05
    public List<UsuarioResponse> listarTodos() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Buscar por ID
    public UsuarioResponse buscarPorId(Long id) {
        return toResponse(buscarPorIdOuFalhar(id));
    }

    // Atualizar
    public UsuarioResponse atualizar(Long id, UsuarioRequest request) {
        UsuarioModel usuario = buscarPorIdOuFalhar(id);

        if (!usuario.getEmail().equals(request.getEmail())
                && repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado: " + request.getEmail());
        }

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setPerfil(request.getPerfil());

        return toResponse(repository.save(usuario));
    }

    // Desativar usuário
    public void desativar(Long id) {
        UsuarioModel usuario = buscarPorIdOuFalhar(id);
        usuario.setAtivo(false);
        repository.save(usuario);
    }

    // Métodos internos
    private UsuarioModel buscarPorIdOuFalhar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException(id));
    }

    private UsuarioModel buscarPorEmailOuFalhar(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNotFoundException(email));
    }

    // Converter model → response (nunca expõe a senha)
    private UsuarioResponse toResponse(UsuarioModel usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .perfil(usuario.getPerfil())
                .ativo(usuario.isAtivo())
                .dataCadastro(usuario.getDataCadastro())
                .build();
    }
}
