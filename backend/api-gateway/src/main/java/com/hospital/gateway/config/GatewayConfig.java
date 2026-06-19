package com.hospital.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Programmatic route definitions for the API Gateway.
 * Routes are also defined in application.yml — this provides additional
 * Java-based routes for complex routing logic.
 */
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // Fallback route for service unavailability
                .route("fallback", r -> r
                        .path("/fallback")
                        .uri("forward:/fallback"))

                .build();
    }
}
