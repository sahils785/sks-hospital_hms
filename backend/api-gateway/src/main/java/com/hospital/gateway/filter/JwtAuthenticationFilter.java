package com.hospital.gateway.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

/**
 * Global gateway filter that validates JWT tokens on incoming requests.
 * Public paths (auth, actuator, swagger) bypass validation.
 * Valid tokens have their claims (userId, roles) forwarded as headers to downstream services.
 */
@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final SecretKey key;

    /** Paths that do not require authentication */
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/actuator",
            "/eureka",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-ui.html",
            "/webjars"
    );

    public JwtAuthenticationFilter(@Value("${jwt.secret}") String jwtSecret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip authentication for public paths
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Check for Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Forward user claims as headers to downstream services
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", String.valueOf(claims.get("userId", Long.class)))
                    .header("X-User-Name", claims.getSubject())
                    .header("X-User-Roles", String.join(",", claims.get("roles", List.class)))
                    .header("X-User-Email", claims.get("email", String.class))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT token for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        } catch (JwtException ex) {
            log.warn("Invalid JWT token for path: {}: {}", path, ex.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}
