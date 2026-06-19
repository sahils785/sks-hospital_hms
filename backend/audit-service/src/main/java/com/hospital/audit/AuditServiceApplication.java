package com.hospital.audit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.hospital.audit", "com.hospital.common"})
public class AuditServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuditServiceApplication.class, args);
    }
}
