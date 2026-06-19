package com.hospital.prescription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions", indexes = {
        @Index(name = "idx_presc_patient", columnList = "patient_id"),
        @Index(name = "idx_presc_doctor", columnList = "doctor_id"),
        @Index(name = "idx_presc_appointment", columnList = "appointment_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Prescription {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "patient_name", length = 100) private String patientName;

    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(name = "doctor_name", length = 100) private String doctorName;

    @Column(name = "appointment_id") private Long appointmentId;

    @Column(columnDefinition = "TEXT") private String diagnosis;
    @Column(columnDefinition = "TEXT") private String notes;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Medication> medications = new ArrayList<>();

    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public void addMedication(Medication medication) {
        medications.add(medication);
        medication.setPrescription(this);
    }
}
