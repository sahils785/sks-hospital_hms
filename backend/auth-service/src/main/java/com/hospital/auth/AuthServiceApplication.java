package com.hospital.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

/**
 * Authentication and User Management Service.
 * Handles JWT authentication, refresh tokens, RBAC, and user CRUD.
 */
@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.hospital.auth", "com.hospital.common"})
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
