package com.hospital.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

/**
 * Request/response logging filter for observability.
 * Logs method, path, status, and duration for every request.
 * Adds a correlation ID for distributed tracing.
 */
@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId = UUID.randomUUID().toString().substring(0, 8);
        Instant startTime = Instant.now();

        // Add correlation ID to request
        ServerHttpRequest modifiedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, correlationId)
                .build();

        log.info("[{}] >>> {} {} from {}",
                correlationId,
                request.getMethod(),
                request.getURI().getPath(),
                request.getRemoteAddress());

        return chain.filter(exchange.mutate().request(modifiedRequest).build())
                .then(Mono.fromRunnable(() -> {
                    long duration = java.time.Duration.between(startTime, Instant.now()).toMillis();
                    log.info("[{}] <<< {} {} - {} ({}ms)",
                            correlationId,
                            request.getMethod(),
                            request.getURI().getPath(),
                            exchange.getResponse().getStatusCode(),
                            duration);
                }));
    }

    @Override
    public int getOrder() {
        return -2; // Execute before JWT filter
    }
}
