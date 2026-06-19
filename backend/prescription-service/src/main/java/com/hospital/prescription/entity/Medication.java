package com.hospital.prescription.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medications")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Medication {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false, length = 100) private String medicineName;
    @Column(length = 50) private String dosage;
    @Column(length = 50) private String frequency;
    @Column(length = 50) private String duration;
    @Column(columnDefinition = "TEXT") private String instructions;
}
