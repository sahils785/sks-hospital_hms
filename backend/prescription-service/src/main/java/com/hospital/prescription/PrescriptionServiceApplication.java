package com.hospital.prescription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.hospital.prescription", "com.hospital.common"})
public class PrescriptionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrescriptionServiceApplication.class, args);
    }
}
