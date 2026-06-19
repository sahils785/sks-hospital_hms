package com.hospital.appointment.dto;

import com.hospital.appointment.entity.Appointment.AppointmentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime appointmentDateTime;
    private LocalDateTime endDateTime;
    private AppointmentStatus status;
    private String reason;
    private String consultationNotes;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
