package com.hospital.prescription.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PrescriptionResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private String diagnosis;
    private String notes;
    private List<MedicationDto> medications;
    private LocalDateTime createdAt;
}
