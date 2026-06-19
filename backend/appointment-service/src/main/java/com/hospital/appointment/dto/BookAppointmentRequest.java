package com.hospital.appointment.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookAppointmentRequest {
    @NotNull(message = "Patient ID is required") private Long patientId;
    private String patientName;
    private String patientEmail;
    @NotNull(message = "Doctor ID is required") private Long doctorId;
    private String doctorName;
    @NotNull(message = "Appointment date/time is required")
    @Future(message = "Appointment must be in the future")
    private LocalDateTime appointmentDateTime;
    private Integer durationMinutes;
    private String reason;
}
