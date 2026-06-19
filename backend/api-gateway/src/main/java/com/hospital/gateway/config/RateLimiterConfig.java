package com.hospital.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.util.Objects;

/**
 * Rate limiter configuration using Redis.
 * Limits requests per IP address via the RequestRateLimiter filter.
 */
@Configuration
public class RateLimiterConfig {

    /**
     * Resolves the rate limit key from the client IP address.
     * Used by Spring Cloud Gateway's RequestRateLimiter filter.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(
                Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                        .getAddress()
                        .getHostAddress()
        );
    }
}
