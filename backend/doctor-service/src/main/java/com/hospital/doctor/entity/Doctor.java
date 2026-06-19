package com.hospital.doctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors", indexes = {
        @Index(name = "idx_doctor_user_id", columnList = "user_id"),
        @Index(name = "idx_doctor_specialization", columnList = "specialization"),
        @Index(name = "idx_doctor_department", columnList = "department")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Doctor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "first_name", nullable = false, length = 50) private String firstName;
    @Column(name = "last_name", nullable = false, length = 50) private String lastName;
    @Column(nullable = false, length = 100) private String email;
    @Column(length = 20) private String phone;

    @Column(nullable = false, length = 100) private String specialization;
    @Column(name = "license_number", nullable = false, unique = true, length = 50) private String licenseNumber;
    @Column(length = 200) private String qualification;
    @Column(name = "experience_years") private Integer experienceYears;
    @Column(name = "consultation_fee", precision = 10, scale = 2) private BigDecimal consultationFee;
    @Column(length = 100) private String department;
    @Column(columnDefinition = "TEXT") private String bio;

    @Builder.Default private boolean available = true;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DoctorSchedule> schedules = new ArrayList<>();

    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public void addSchedule(DoctorSchedule schedule) {
        schedules.add(schedule);
        schedule.setDoctor(this);
    }
}
