package com.hospital.auth;

import com.hospital.auth.entity.Role;
import com.hospital.auth.entity.User;
import com.hospital.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Seeding initial users...");

            String sharedHash = passwordEncoder.encode("Admin@123");

            // 1. Admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@hospital.com")
                    .passwordHash(sharedHash)
                    .firstName("System")
                    .lastName("Administrator")
                    .phone("+1234567890")
                    .enabled(true)
                    .roles(new HashSet<>(Set.of(Role.ADMIN)))
                    .build();
            userRepository.save(admin);

            // 2. Doctor
            User doctor = User.builder()
                    .username("dr.smith")
                    .email("dr.smith@hospital.com")
                    .passwordHash(sharedHash)
                    .firstName("John")
                    .lastName("Smith")
                    .phone("+1234567891")
                    .enabled(true)
                    .roles(new HashSet<>(Set.of(Role.DOCTOR)))
                    .build();
            userRepository.save(doctor);

            // 3. Receptionist
            User receptionist = User.builder()
                    .username("receptionist1")
                    .email("reception@hospital.com")
                    .passwordHash(sharedHash)
                    .firstName("Sarah")
                    .lastName("Johnson")
                    .phone("+1234567892")
                    .enabled(true)
                    .roles(new HashSet<>(Set.of(Role.RECEPTIONIST)))
                    .build();
            userRepository.save(receptionist);

            // 4. Patient
            User patient = User.builder()
                    .username("patient1")
                    .email("patient@hospital.com")
                    .passwordHash(sharedHash)
                    .firstName("Jane")
                    .lastName("Doe")
                    .phone("+1234567893")
                    .enabled(true)
                    .roles(new HashSet<>(Set.of(Role.PATIENT)))
                    .build();
            userRepository.save(patient);

            // 5. Billing Staff
            User billing = User.builder()
                    .username("billing1")
                    .email("billing@hospital.com")
                    .passwordHash(sharedHash)
                    .firstName("Mike")
                    .lastName("Wilson")
                    .phone("+1234567894")
                    .enabled(true)
                    .roles(new HashSet<>(Set.of(Role.BILLING_STAFF)))
                    .build();
            userRepository.save(billing);

            log.info("Demo users seeded successfully!");
        } else {
            log.info("Database contains existing users. Seeding skipped.");
        }
    }
}
