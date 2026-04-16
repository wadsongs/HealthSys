package com.br.unifor.usuarios.service;

import com.br.unifor.usuarios.model.UsuarioModel;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String gerarToken(UsuarioModel usuario) {
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", usuario.getId())
                .claim("nome", usuario.getNome())
                .claim("perfil", usuario.getPerfil())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getChave())
                .compact();
    }

    // Extrair e-mail do token
    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    // Extrair perfil do token
    public String extrairPerfil(String token) {
        return extrairClaims(token).get("perfil", String.class);
    }

    // Extrair ID do token
    public Long extrairId(String token) {
        return extrairClaims(token).get("id", Long.class);
    }

    // Validar token
    public boolean tokenValido(String token, UsuarioModel usuario) {
        final String email = extrairEmail(token);
        return email.equals(usuario.getEmail()) && !tokenExpirado(token);
    }

    private boolean tokenExpirado(String token) {
        return extrairClaims(token).getExpiration().before(new Date());
    }

    private Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getChave() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}
