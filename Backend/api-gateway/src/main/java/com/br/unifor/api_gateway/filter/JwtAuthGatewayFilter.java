package com.br.unifor.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;

@Slf4j
@Component
public class JwtAuthGatewayFilter extends AbstractGatewayFilterFactory<JwtAuthGatewayFilter.Config> {

    @Value("${jwt.secret}")
    private String secret;

    public JwtAuthGatewayFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Importante para CORS / SockJS: liberar preflight OPTIONS.
            if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else {
                String accessToken = exchange.getRequest().getQueryParams().getFirst("access_token");
                if (accessToken != null && !accessToken.isBlank()) {
                    token = accessToken;
                }
            }

            if (token == null) {
                return semAutorizacao(exchange, "Token não fornecido");
            }

            try {
                Claims claims = extrairClaims(token);

                ServerWebExchange exchangeModificado = exchange.mutate()
                        .request(exchange.getRequest().mutate()
                                .header("X-User-Id", claims.get("id").toString())
                                .header("X-User-Perfil", claims.get("perfil").toString())
                                .header("X-User-Email", claims.getSubject())
                                .build())
                        .build();

                return chain.filter(exchangeModificado);
            } catch (Exception e) {
                log.error("Token inválido: {}", e.getMessage());
                return semAutorizacao(exchange, "Token inválido ou expirado");
            }
        };
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

    private Mono<Void> semAutorizacao(ServerWebExchange exchange, String mensagem) {
        log.warn("Acesso negado: {}", mensagem);

        // Headers de CORS removidos para evitar conflito com o globalcors do Gateway
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Configurações adicionais do filtro, se necessárias no futuro
    }
}