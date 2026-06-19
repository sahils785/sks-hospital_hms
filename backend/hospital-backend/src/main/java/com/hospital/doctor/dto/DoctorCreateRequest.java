package com.hospital.doctor.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DoctorCreateRequest {
    @NotNull private Long userId;
    @NotBlank @Size(max = 50) private String firstName;
    @NotBlank @Size(max = 50) private String lastName;
    @NotBlank @Email private String email;
    private String phone;
    @NotBlank private String specialization;
    @NotBlank private String licenseNumber;
    private String qualification;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String department;
    private String bio;
    private List<ScheduleDto> schedules;
}
