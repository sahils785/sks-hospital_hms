package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency_contacts")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String relationship;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;
}
