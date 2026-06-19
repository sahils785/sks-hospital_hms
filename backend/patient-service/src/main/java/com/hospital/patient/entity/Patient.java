package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients", indexes = {
        @Index(name = "idx_patient_user_id", columnList = "user_id"),
        @Index(name = "idx_patient_phone", columnList = "phone")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "insurance_provider", length = 100)
    private String insuranceProvider;

    @Column(name = "insurance_policy_number", length = 50)
    private String insurancePolicyNumber;

    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MedicalHistory> medicalHistories = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EmergencyContact> emergencyContacts = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public void addMedicalHistory(MedicalHistory history) {
        medicalHistories.add(history);
        history.setPatient(this);
    }

    public void addEmergencyContact(EmergencyContact contact) {
        emergencyContacts.add(contact);
        contact.setPatient(this);
    }
}
