package com.hospital.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Fallback controller for circuit breaker scenarios.
 * Returns graceful error responses when downstream services are unavailable.
 */
@RestController
public class FallbackController {

    @GetMapping("/fallback")
    public Mono<ResponseEntity<Map<String, Object>>> fallback() {
        Map<String, Object> response = Map.of(
                "success", false,
                "message", "Service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString(),
                "status", HttpStatus.SERVICE_UNAVAILABLE.value()
        );
        return Mono.just(ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response));
    }
}
