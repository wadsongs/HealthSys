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

    private Mono<Void> semAutorizacao (ServerWebExchange exchange, String mensagem) {
        log.warn("Acesso negado: {}" ,mensagem);
        // Se bloquearmos uma requisição cross-origin sem headers CORS, o browser acusa "erro de CORS".
        // Aqui refletimos o Origin para manter o comportamento do globalcors no caminho de erro.
        String origin = exchange.getRequest().getHeaders().getFirst(HttpHeaders.ORIGIN);
        if (origin != null && !origin.isBlank()) {
            exchange.getResponse().getHeaders().set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
            exchange.getResponse().getHeaders().set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
            exchange.getResponse().getHeaders().set(HttpHeaders.VARY, "Origin");
            exchange.getResponse().getHeaders().set(
                    HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                    exchange.getRequest().getHeaders().getFirst(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS) != null
                            ? exchange.getRequest().getHeaders().getFirst(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS)
                            : "*"
            );
            exchange.getResponse().getHeaders().set(
                    HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
            );
        }
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    public static class Config {

    }

}
