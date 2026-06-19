package com.hospital.doctor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_schedules")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DoctorSchedule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @Column(name = "slot_duration_minutes", nullable = false) @Builder.Default private int slotDurationMinutes = 30;
    @Column(name = "max_patients") @Builder.Default private int maxPatients = 20;
    @Builder.Default private boolean active = true;
}
