package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", indexes = {
        @Index(name = "idx_apt_patient", columnList = "patient_id"),
        @Index(name = "idx_apt_doctor", columnList = "doctor_id"),
        @Index(name = "idx_apt_datetime", columnList = "appointment_date_time"),
        @Index(name = "idx_apt_status", columnList = "status")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Appointment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "patient_name", length = 100) private String patientName;
    @Column(name = "patient_email", length = 100) private String patientEmail;

    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(name = "doctor_name", length = 100) private String doctorName;

    @Column(name = "appointment_date_time", nullable = false)
    private LocalDateTime appointmentDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT") private String reason;
    @Column(name = "consultation_notes", columnDefinition = "TEXT") private String consultationNotes;
    @Column(name = "cancellation_reason", columnDefinition = "TEXT") private String cancellationReason;

    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum AppointmentStatus {
        SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED
    }
}
