package com.hospital.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.hospital.patient", "com.hospital.common"})
public class PatientServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PatientServiceApplication.class, args);
    }
}
