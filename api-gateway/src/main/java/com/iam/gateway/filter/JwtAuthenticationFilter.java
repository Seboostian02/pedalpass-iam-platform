package com.iam.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/password/forgot",
            "/api/v1/auth/password/reset",
            "/swagger-ui.html",
            "/swagger-ui",
            "/webjars",
            "/v3/api-docs"
    );

    private final SecretKey secretKey;
    private final ReactiveRedisTemplate<String, String> redisTemplate;

    public JwtAuthenticationFilter(
            @Value("${jwt.secret-key}") String secret,
            ReactiveRedisTemplate<String, String> redisTemplate) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        return isTokenBlacklisted(token)
                .flatMap(blacklisted -> {
                    if (blacklisted) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }

                    try {
                        Claims claims = Jwts.parser()
                                .verifyWith(secretKey)
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();

                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User-Id", claims.getSubject())
                                .header("X-User-Email", claims.get("email", String.class))
                                .header("X-User-Roles", claims.get("roles", String.class))
                                .header("X-User-Permissions", claims.get("permissions", String.class))
                                .build();

                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    } catch (Exception e) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }
                });
    }

    private Mono<Boolean> isTokenBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
