package com.hospital.doctor.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String specialization;
    private String licenseNumber;
    private String qualification;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String department;
    private String bio;
    private boolean available;
    private List<ScheduleDto> schedules;
    private LocalDateTime createdAt;
}
