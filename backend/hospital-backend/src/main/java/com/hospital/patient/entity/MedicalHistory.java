package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "medical_history")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "condition_name", nullable = false, length = 100)
    private String conditionName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "diagnosed_date")
    private LocalDate diagnosedDate;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(length = 100)
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum Status {
        ACTIVE, RESOLVED, CHRONIC, IN_TREATMENT
    }
}
